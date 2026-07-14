import Docker from "dockerode";
import { Types } from "mongoose";
import { HttpError } from "../middleware/error";
import type { ProjectTopology, TopologyNode } from "../types";
import { ProjectSession, ProjectSessionDoc } from "../models/ProjectSession";
import {
  docker,
  QUOTAS,
  MANAGED_LABEL,
  SESSION_LABEL,
  PUBLISH_HOST,
  cleanupBySessionLabel,
} from "./dockerSandbox";

/**
 * Moteur de topologie générique pour les Projets.
 *
 * Généralise la logique attaquant/cible figée de `dockerSandbox.startSession`
 * en un provisioning multi-nœuds / multi-réseaux :
 *  - N réseaux (isolés ou non) avec IPAM par sous-réseau,
 *  - N nœuds, chacun sur SES réseaux avec SES IP statiques / capacités / sysctls,
 *  - routes explicites injectées après démarrage (Docker ne route pas entre
 *    bridges tout seul),
 *  - un réseau de publication DÉDIÉ par nœud à terminal/ports (jamais partagé,
 *    sinon deux nœuds pourraient communiquer hors des règles de la topologie).
 *
 * Garanties conservées à l'identique : labels systématiques, quotas sur CHAQUE
 * conteneur, nettoyage complet par label en cas d'échec.
 */

function log(msg: string): void {
  console.log(`[topology] ${msg}`);
}
function warn(msg: string, err?: unknown): void {
  console.warn(`[topology] ${msg}${err ? ` — ${(err as Error).message ?? err}` : ""}`);
}

/** Exécute une commande dans un conteneur ; renvoie code de sortie + sortie. */
export async function execInNode(
  dockerId: string,
  cmd: string[],
  timeoutMs = 8000
): Promise<{ exitCode: number; output: string }> {
  const container = docker.getContainer(dockerId);
  const exec = await container.exec({ Cmd: cmd, AttachStdout: true, AttachStderr: true });
  const stream = await exec.start({ hijack: true, stdin: false });
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    stream.on("data", (d: Buffer) => chunks.push(d));
    stream.on("end", finish);
    stream.on("error", finish);
    setTimeout(finish, timeoutMs);
  });
  let exitCode = -1;
  try {
    const info = await exec.inspect();
    exitCode = typeof info.ExitCode === "number" ? info.ExitCode : -1;
  } catch {
    /* conteneur disparu / exec non inspectable */
  }
  // Le flux hijacké contient les en-têtes de multiplexage docker ; on retire les
  // octets de contrôle pour garder un texte lisible (les checks se basent surtout
  // sur le code de sortie).
  const output = Buffer.concat(chunks).toString("utf8").replace(/[\x00-\x08\x0e-\x1f]/g, "");
  return { exitCode, output };
}

/** IP « de service » d'un nœud (son IP sur son réseau primaire). */
export function resolveNodeIp(topology: ProjectTopology, nodeId: string): string | undefined {
  const node = topology.nodes.find((n) => n.id === nodeId);
  return node?.networks[0]?.ip;
}

/** La session projet active de l'utilisateur, s'il y en a une. */
export async function getActiveProjectSession(userId: string): Promise<ProjectSessionDoc | null> {
  return ProjectSession.findOne({ user: userId, status: { $in: ["starting", "running"] } });
}

function resources(node: TopologyNode): { Memory: number; NanoCpus: number } {
  const memMb = node.resources?.memMb ?? QUOTAS.Memory / (1024 * 1024);
  const cpu = node.resources?.cpu ?? QUOTAS.NanoCpus / 1e9;
  return { Memory: Math.round(memMb * 1024 * 1024), NanoCpus: Math.round(cpu * 1e9) };
}

/**
 * Provisionne toute la topologie d'un projet et renvoie la session persistée.
 * 409 si l'utilisateur a déjà un projet actif. Nettoyage complet à tout échec.
 */
export async function startProjectSession(
  userId: string,
  project: { slug: string; topology: ProjectTopology; ttlSec: number }
): Promise<ProjectSessionDoc> {
  const existing = await getActiveProjectSession(userId);
  if (existing) {
    throw new HttpError(409, "Tu as déjà un projet actif — arrête-le avant d'en démarrer un autre.");
  }

  const sessionId = new Types.ObjectId();
  const sid = sessionId.toString();
  const labels = { [MANAGED_LABEL]: "true", [SESSION_LABEL]: sid };
  const { topology } = project;
  const labNetName = (name: string) => `cyberace_${name}_${sid}`;
  const pubNetName = (nodeId: string) => `cyberace_pub_${nodeId}_${sid}`;

  try {
    // 1) Réseaux du lab (IPAM par sous-réseau ; gateway .1 auto par Docker).
    const networkIds: { name: string; dockerId: string }[] = [];
    const labNetId: Record<string, string> = {};
    for (const net of topology.networks) {
      const dnet = await docker.createNetwork({
        Name: labNetName(net.name),
        Driver: "bridge",
        Internal: net.internal,
        Labels: labels,
        IPAM: { Config: [{ Subnet: net.cidr }] },
      });
      const did = (dnet as unknown as { id: string }).id;
      networkIds.push({ name: net.name, dockerId: did });
      labNetId[net.name] = did;
    }

    // 2) Nœuds : création (endpoint primaire = 1er réseau → eth0), puis
    //    rattachement des réseaux secondaires, puis d'un réseau pub DÉDIÉ si le
    //    nœud publie des ports (permet la publication d'un port hôte sans créer
    //    de connectivité latérale entre nœuds).
    const containerIds: { nodeId: string; dockerId: string }[] = [];
    const nodeContainer: Record<string, Docker.Container> = {};

    for (const node of topology.nodes) {
      const primary = node.networks[0];
      if (!primary) throw new Error(`nœud ${node.id} sans réseau`);

      const exposedPorts: Record<string, Record<string, never>> = {};
      const portBindings: Record<string, { HostPort: string }[]> = {};
      for (const p of node.ports ?? []) {
        const k = `${p.containerPort}/tcp`;
        exposedPorts[k] = {};
        portBindings[k] = [{ HostPort: "0" }];
      }

      const { Memory, NanoCpus } = resources(node);
      const hostConfig: Docker.HostConfig = {
        Memory,
        NanoCpus,
        PidsLimit: QUOTAS.PidsLimit,
        ReadonlyRootfs: false,
        NetworkMode: labNetName(primary.name),
        CapAdd: node.capAdd ?? [],
        PortBindings: portBindings,
        ...(node.sysctls && Object.keys(node.sysctls).length ? { Sysctls: node.sysctls } : {}),
      };
      const env = node.env ? Object.entries(node.env).map(([k, v]) => `${k}=${v}`) : undefined;

      const container = await docker.createContainer({
        Image: node.image,
        name: `cyberace_${node.id}_${sid}`,
        Labels: labels,
        ExposedPorts: exposedPorts,
        ...(env ? { Env: env } : {}),
        HostConfig: hostConfig,
        NetworkingConfig: {
          EndpointsConfig: {
            [labNetName(primary.name)]: {
              Aliases: [node.id],
              IPAMConfig: { IPv4Address: primary.ip },
            },
          },
        },
      } as Docker.ContainerCreateOptions);

      // Réseaux secondaires (le firewall en a 3).
      for (const att of node.networks.slice(1)) {
        await docker.getNetwork(labNetId[att.name]).connect({
          Container: container.id,
          EndpointConfig: { Aliases: [node.id], IPAMConfig: { IPv4Address: att.ip } },
        });
      }

      // Réseau pub dédié (publication des ports) — uniquement si le nœud publie.
      if ((node.ports ?? []).length > 0) {
        const pnet = await docker.createNetwork({
          Name: pubNetName(node.id),
          Driver: "bridge",
          Internal: false,
          Labels: labels,
        });
        const pid = (pnet as unknown as { id: string }).id;
        networkIds.push({ name: `pub_${node.id}`, dockerId: pid });
        await docker.getNetwork(pid).connect({ Container: container.id });
      }

      await container.start();
      containerIds.push({ nodeId: node.id, dockerId: container.id });
      nodeContainer[node.id] = container;
    }

    // 3) Routes post-démarrage (Docker ne route pas entre bridges). Un échec =
    //    échec de session. Un retry court absorbe la mise en place réseau.
    for (const node of topology.nodes) {
      for (const route of node.postStartRoutes ?? []) {
        const cmd = ["ip", "route", "add", route.network, "via", route.viaIp];
        let { exitCode, output } = await execInNode(nodeContainer[node.id].id, cmd);
        if (exitCode !== 0) {
          await new Promise((r) => setTimeout(r, 800));
          ({ exitCode, output } = await execInNode(nodeContainer[node.id].id, cmd));
        }
        // "File exists" (route déjà présente) = succès idempotent.
        if (exitCode !== 0 && !/File exists/i.test(output)) {
          throw new Error(`route ${route.network} via ${route.viaIp} sur ${node.id} a échoué (code ${exitCode}) ${output}`);
        }
      }
    }

    // 4) URLs des terminaux (port kind:"terminal", sinon 1er port publié).
    const terminalUrls: { nodeId: string; url: string }[] = [];
    for (const node of topology.nodes.filter((n) => n.terminal)) {
      const termPort = (node.ports ?? []).find((p) => p.kind === "terminal") ?? (node.ports ?? [])[0];
      if (!termPort) continue;
      const info = await nodeContainer[node.id].inspect();
      const hp = info.NetworkSettings?.Ports?.[`${termPort.containerPort}/tcp`]?.[0]?.HostPort;
      if (!hp) throw new Error(`port terminal ${termPort.containerPort} non publié pour ${node.id}`);
      terminalUrls.push({ nodeId: node.id, url: `http://${PUBLISH_HOST}:${hp}` });
    }

    // 5) Persistance.
    const session = await ProjectSession.create({
      _id: sessionId,
      user: new Types.ObjectId(userId),
      projectSlug: project.slug,
      networkIds,
      containerIds,
      terminalUrls,
      status: "running",
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + project.ttlSec * 1000),
    });

    log(`session projet ${sid} démarrée (${project.slug}) : ${containerIds.length} nœuds, ${networkIds.length} réseaux`);
    return session;
  } catch (err) {
    warn(`échec démarrage session projet ${sid}, nettoyage…`, err);
    await cleanupBySessionLabel(sid);
    if (err instanceof HttpError) throw err;
    throw new HttpError(500, "Impossible de démarrer le projet. Vérifie que Docker est lancé et les images construites.");
  }
}

/** Arrêt idempotent et tolérant : conteneurs + réseaux, puis balayage par label. */
export async function stopProjectSession(sessionId: string): Promise<void> {
  const session = await ProjectSession.findById(sessionId);
  if (!session) {
    await cleanupBySessionLabel(String(sessionId));
    return;
  }
  if (session.status === "stopped") return;
  try {
    session.status = "stopping";
    await session.save();
  } catch (err) {
    warn(`maj statut stopping ignorée pour ${sessionId}`, err);
  }
  await cleanupBySessionLabel(String(session._id));
  try {
    session.status = "stopped";
    await session.save();
  } catch (err) {
    warn(`maj statut stopped ignorée pour ${sessionId}`, err);
  }
  log(`session projet ${sessionId} arrêtée.`);
}

/** Arrête la session projet active de l'utilisateur, s'il y en a une. */
export async function stopProjectSessionForUser(userId: string): Promise<void> {
  const session = await getActiveProjectSession(userId);
  if (session) await stopProjectSession(String(session._id));
}

/** Purge des sessions projet expirées (appelée par le reaper du serveur). */
export async function reapExpiredProjects(): Promise<void> {
  const expired = await ProjectSession.find({
    status: { $in: ["starting", "running"] },
    expiresAt: { $lt: new Date() },
  });
  for (const s of expired) {
    log(`session projet ${s._id} expirée → nettoyage`);
    await stopProjectSession(String(s._id));
  }
}
