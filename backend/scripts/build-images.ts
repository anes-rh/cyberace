/**
 * Build every sandbox Docker image against the configured daemon.
 *
 * Reads DOCKER_HOST (e.g. tcp://192.168.1.48:2375) from the environment so it
 * works against a remote engine running inside a VirtualBox VM — the Windows
 * host here cannot run Docker Desktop (broken WSL2/Virtual Machine Platform).
 *
 * Each directory under sandboxes/images/<name> is packed as a build context and
 * tagged `cyberace/<name>:latest`. attacker-base is built first.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/build-images.ts            # all
 *   npx ts-node --transpile-only scripts/build-images.ts module11-vhost-hidden ...
 */
import "dotenv/config";
import path from "path";
import fs from "fs";
import Docker from "dockerode";
import tarFs from "tar-fs";

const IMAGES_DIR = path.resolve(__dirname, "..", "sandboxes", "images");

function buildDockerOptions(): Docker.DockerOptions {
  const host = process.env.DOCKER_HOST?.trim();
  if (host) {
    const m = /^tcp:\/\/([^:/]+):(\d+)$/.exec(host);
    if (!m) throw new Error(`DOCKER_HOST invalide: "${host}" (tcp://host:port)`);
    return { host: m[1], port: Number(m[2]) };
  }
  return process.platform === "win32"
    ? { socketPath: "//./pipe/docker_engine" }
    : { socketPath: "/var/run/docker.sock" };
}

const docker = new Docker(buildDockerOptions());

/** Distinct `FROM` base images referenced across the given image dirs. */
function collectBaseImages(names: string[]): string[] {
  const bases = new Set<string>();
  for (const name of names) {
    const df = path.join(IMAGES_DIR, name, "Dockerfile");
    if (!fs.existsSync(df)) continue;
    for (const line of fs.readFileSync(df, "utf8").split(/\r?\n/)) {
      const m = /^FROM\s+(\S+)/i.exec(line.trim());
      if (m && !m[1].startsWith("cyberace/")) bases.add(m[1]);
    }
  }
  return [...bases];
}

/** Pre-pull a base image with progress; tolerates "already present". */
function pullBase(ref: string): Promise<void> {
  return new Promise((resolve, reject) => {
    docker.pull(ref, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) return reject(err);
      docker.modem.followProgress(
        stream,
        (doneErr) => (doneErr ? reject(doneErr) : resolve()),
        () => {}
      );
    });
  });
}

/** Build one image directory; resolves on success, rejects on build error. */
function buildOne(name: string): Promise<void> {
  const dir = path.join(IMAGES_DIR, name);
  const tag = `cyberace/${name}:latest`;
  const tarStream = tarFs.pack(dir);
  return new Promise((resolve, reject) => {
    docker.buildImage(tarStream, { t: tag }, (err, stream) => {
      if (err) return reject(err);
      if (!stream) return reject(new Error("pas de flux de build"));
      docker.modem.followProgress(
        stream,
        (doneErr, output) => {
          if (doneErr) return reject(doneErr);
          // The daemon reports build errors inside the stream, not via doneErr.
          const errLine = output.find((o: { error?: string }) => o.error);
          if (errLine) return reject(new Error(errLine.error));
          resolve();
        },
        (evt: { stream?: string }) => {
          if (evt.stream && evt.stream.trim()) {
            process.stdout.write(`   ${evt.stream.replace(/\n+$/, "")}\n`);
          }
        }
      );
    });
  });
}

async function main(): Promise<void> {
  const all = fs
    .readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const requested = process.argv.slice(2);
  let targets = requested.length ? requested : all;

  // Always build attacker-base first (module images may depend on it later).
  targets = [
    ...targets.filter((t) => t === "attacker-base"),
    ...targets.filter((t) => t !== "attacker-base"),
  ];

  const host = process.env.DOCKER_HOST || "socket local";
  console.log(`Daemon: ${host}`);
  console.log(`Images à builder (${targets.length}): ${targets.join(", ")}\n`);

  // Pre-pull base images once (avoids per-build registry timeouts on a slow VM).
  const bases = collectBaseImages(targets.filter((t) => all.includes(t)));
  for (const ref of bases) {
    process.stdout.write(`⇩  pull base ${ref} …\n`);
    try {
      await pullBase(ref);
      console.log(`✔  base ${ref}\n`);
    } catch (e) {
      console.error(`X  pull base ${ref} : ${(e as Error).message}\n`);
    }
  }

  const failures: string[] = [];
  for (const name of targets) {
    if (!all.includes(name)) {
      console.log(`⚠  ${name} : dossier introuvable, ignoré`);
      failures.push(name);
      continue;
    }
    process.stdout.write(`▶  build cyberace/${name}:latest …\n`);
    try {
      await buildOne(name);
      console.log(`✔  cyberace/${name}:latest\n`);
    } catch (e) {
      console.error(`X  ECHEC ${name} : ${(e as Error).message}\n`);
      failures.push(name);
    }
  }

  console.log("──────────────────────────────────────────");
  console.log(`Terminé : ${targets.length - failures.length}/${targets.length} réussies`);
  if (failures.length) {
    console.log(`Échecs : ${failures.join(", ")}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Erreur fatale:", e);
  process.exit(1);
});
