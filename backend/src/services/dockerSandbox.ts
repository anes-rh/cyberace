import Docker from "dockerode";
import { Types } from "mongoose";
import { SandboxSession, SandboxSessionDoc } from "../models/SandboxSession";
import { HttpError } from "../middleware/error";
import type { SandboxConfig } from "../types";

/**
 * Docker orchestration for the practical labs.
 *
 * Design rules (non-negotiable, POC-local):
 *  - Every network/container we create carries the labels
 *    `com.cyberace.managed=true` + `com.cyberace.session=<id>` so orphans can be
 *    reaped by label alone, even if Mongo loses track of a session.
 *  - One isolated bridge network per session, Internal:true (no Internet).
 *  - Hard resource quotas on EVERY container, no exception.
 *  - The target gets NO added capability; only the attacker gets `attackerCapAdd`.
 *  - At most one active session per user (409 otherwise).
 */

const MANAGED_LABEL = "com.cyberace.managed";
const SESSION_LABEL = "com.cyberace.session";

/** Resource quotas applied to every container without exception. */
const QUOTAS = {
  Memory: 160 * 1024 * 1024, // 160 Mo
  NanoCpus: 300_000_000, // 0.3 CPU
  PidsLimit: 128,
  ReadonlyRootfs: false,
};

const docker = new Docker(
  process.platform === "win32"
    ? { socketPath: "//./pipe/docker_engine" }
    : { socketPath: "/var/run/docker.sock" }
);

function log(msg: string): void {
  console.log(`[sandbox] ${msg}`);
}
function warn(msg: string, err?: unknown): void {
  console.warn(`[sandbox] ${msg}${err ? ` — ${(err as Error).message ?? err}` : ""}`);
}

/** Force-remove a container by id, swallowing "already gone" errors. */
async function removeContainerSafe(id: string): Promise<void> {
  try {
    await docker.getContainer(id).remove({ force: true });
  } catch (err) {
    warn(`suppression conteneur ${id.slice(0, 12)} ignorée`, err);
  }
}

/** Force-remove a network by id, swallowing "already gone" errors. */
async function removeNetworkSafe(id: string): Promise<void> {
  try {
    await docker.getNetwork(id).remove();
  } catch (err) {
    warn(`suppression réseau ${id.slice(0, 12)} ignorée`, err);
  }
}

/** Remove every Docker resource carrying our session label (containers first, then network). */
async function cleanupBySessionLabel(sessionId: string): Promise<void> {
  const filter = { label: [`${SESSION_LABEL}=${sessionId}`] };
  try {
    const containers = await docker.listContainers({ all: true, filters: filter as never });
    for (const c of containers) await removeContainerSafe(c.Id);
  } catch (err) {
    warn("listing conteneurs par label échoué", err);
  }
  try {
    const networks = await docker.listNetworks({ filters: filter as never });
    for (const n of networks) await removeNetworkSafe(n.Id);
  } catch (err) {
    warn("listing réseaux par label échoué", err);
  }
}

/** The single active session for a user, if any (status starting|running). */
export async function getActiveSession(userId: string): Promise<SandboxSessionDoc | null> {
  return SandboxSession.findOne({ user: userId, status: { $in: ["starting", "running"] } });
}

/**
 * Create the isolated network + target + attacker containers for a course and
 * return the persisted running session. Throws 409 if the user already has one.
 */
export async function startSession(
  userId: string,
  course: { slug: string; sandbox: SandboxConfig }
): Promise<SandboxSessionDoc> {
  const existing = await getActiveSession(userId);
  if (existing) {
    throw new HttpError(409, "Tu as déjà un lab actif — arrête-le avant d'en démarrer un autre.");
  }

  const { sandbox } = course;
  // Pre-generate the session id so every Docker resource is labelled up-front,
  // making orphan cleanup reliable even if the Mongo write below fails.
  const sessionId = new Types.ObjectId();
  const sid = sessionId.toString();
  const labels = { [MANAGED_LABEL]: "true", [SESSION_LABEL]: sid };
  const networkName = `cyberace_net_${sid}`;

  const terminalContainerPort = sandbox.ports[0]?.containerPort ?? 7681;
  const portKey = `${terminalContainerPort}/tcp`;

  try {
    // 1) Isolated internal network (no Internet).
    const network = await docker.createNetwork({
      Name: networkName,
      Driver: "bridge",
      Internal: true,
      Labels: labels,
    });
    const networkId = (network as unknown as { id: string }).id;

    // 2) Target container (no added capability), resolvable as "target".
    const target = await docker.createContainer({
      Image: sandbox.targetImage,
      name: `cyberace_target_${sid}`,
      Labels: labels,
      HostConfig: {
        ...QUOTAS,
        NetworkMode: networkName,
      },
      NetworkingConfig: {
        EndpointsConfig: { [networkName]: { Aliases: ["target"] } },
      },
    } as Docker.ContainerCreateOptions);
    await target.start();

    // 3) Attacker container: extra caps + published terminal port, resolvable as "attacker".
    const exposedPorts: Record<string, Record<string, never>> = {};
    const portBindings: Record<string, { HostPort: string }[]> = {};
    for (const p of sandbox.ports) {
      const key = `${p.containerPort}/tcp`;
      exposedPorts[key] = {};
      portBindings[key] = [{ HostPort: "0" }]; // random host port
    }

    const attacker = await docker.createContainer({
      Image: sandbox.attackerImage,
      name: `cyberace_attacker_${sid}`,
      Labels: labels,
      ExposedPorts: exposedPorts,
      HostConfig: {
        ...QUOTAS,
        NetworkMode: networkName,
        CapAdd: sandbox.attackerCapAdd ?? [],
        PortBindings: portBindings,
      },
      NetworkingConfig: {
        EndpointsConfig: { [networkName]: { Aliases: ["attacker"] } },
      },
    } as Docker.ContainerCreateOptions);
    await attacker.start();

    // 4) Discover the published host port for the web terminal.
    const info = await attacker.inspect();
    const mapped = info.NetworkSettings?.Ports?.[portKey];
    const hostPort = mapped && mapped[0]?.HostPort;
    if (!hostPort) {
      throw new Error(`Port ${portKey} non publié par le conteneur attaquant.`);
    }
    const terminalUrl = `http://localhost:${hostPort}`;

    // 5) Persist the running session (id pinned to the pre-generated one).
    const session = await SandboxSession.create({
      _id: sessionId,
      user: new Types.ObjectId(userId),
      courseSlug: course.slug,
      networkId,
      networkName,
      attackerContainerId: attacker.id,
      targetContainerId: target.id,
      terminalUrl,
      status: "running",
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + sandbox.ttlSec * 1000),
    });

    log(`session ${sid} démarrée (cours ${course.slug}) → ${terminalUrl}`);
    return session;
  } catch (err) {
    warn(`échec du démarrage de la session ${sid}, nettoyage…`, err);
    await cleanupBySessionLabel(sid);
    if (err instanceof HttpError) throw err;
    throw new HttpError(500, "Impossible de démarrer le lab. Vérifie que Docker est lancé et les images construites.");
  }
}

/**
 * Idempotent, error-tolerant teardown of a session and its Docker resources.
 * Safe to call even if the containers/network were already removed by hand.
 */
export async function stopSession(sessionId: string): Promise<void> {
  const session = await SandboxSession.findById(sessionId);
  if (!session) {
    // Nothing in Mongo, but still sweep any lingering labelled resources.
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

  // Remove by stored ids first, then sweep by label to catch anything missed.
  await removeContainerSafe(session.attackerContainerId);
  await removeContainerSafe(session.targetContainerId);
  await removeNetworkSafe(session.networkId);
  await cleanupBySessionLabel(String(session._id));

  try {
    session.status = "stopped";
    await session.save();
  } catch (err) {
    warn(`maj statut stopped ignorée pour ${sessionId}`, err);
  }
  log(`session ${sessionId} arrêtée.`);
}

/** Stop the user's single active session, if any. */
export async function stopSessionForUser(userId: string): Promise<void> {
  const session = await getActiveSession(userId);
  if (session) await stopSession(String(session._id));
}

/** Reaper: stop every running session past its TTL. */
export async function reapExpired(): Promise<void> {
  const now = new Date();
  const expired = await SandboxSession.find({ status: "running", expiresAt: { $lt: now } });
  if (!expired.length) return;
  log(`reaper: ${expired.length} session(s) expirée(s) à nettoyer.`);
  for (const s of expired) await stopSession(String(s._id));
}

/**
 * Boot / manual cleanup: destroy every Docker resource we ever created (by the
 * managed label) and mark any lingering Mongo session as stopped. Essential in
 * dev because ts-node-dev respawns the process on every file save.
 */
export async function pruneOrphans(): Promise<void> {
  const filter = { label: [`${MANAGED_LABEL}=true`] };
  let containers = 0;
  let networks = 0;
  try {
    const list = await docker.listContainers({ all: true, filters: filter as never });
    for (const c of list) {
      await removeContainerSafe(c.Id);
      containers += 1;
    }
  } catch (err) {
    warn("prune: listing conteneurs échoué (Docker est-il lancé ?)", err);
  }
  try {
    const list = await docker.listNetworks({ filters: filter as never });
    for (const n of list) {
      await removeNetworkSafe(n.Id);
      networks += 1;
    }
  } catch (err) {
    warn("prune: listing réseaux échoué", err);
  }
  try {
    await SandboxSession.updateMany(
      { status: { $in: ["starting", "running", "stopping"] } },
      { $set: { status: "stopped", errorMessage: "Nettoyé au démarrage du serveur." } }
    );
  } catch (err) {
    warn("prune: maj des sessions Mongo échouée", err);
  }
  log(`prune: ${containers} conteneur(s) et ${networks} réseau(x) gérés supprimés.`);
}
