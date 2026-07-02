import mongoose from "mongoose";
import { env } from "./env";

let memoryServer: { stop: () => Promise<unknown> } | null = null;

/**
 * Connect to MongoDB.
 *
 * Resolution order:
 *   1. If USE_MEMORY_DB=true            -> spin up an in-memory MongoDB.
 *   2. Else if MONGODB_URI is provided  -> use it (fall back to in-memory on failure in dev).
 *   3. Else (no URI)                    -> spin up an in-memory MongoDB.
 *
 * The in-memory server makes the project runnable with zero external setup.
 */
export async function connectDatabase(): Promise<string> {
  mongoose.set("strictQuery", true);

  if (!env.useMemoryDb && env.mongoUri) {
    try {
      await mongoose.connect(env.mongoUri);
      return `MongoDB connecté (${redact(env.mongoUri)})`;
    } catch (err) {
      if (env.isProd) throw err;
      console.warn(
        "[db] Connexion à MONGODB_URI impossible, bascule sur MongoDB en mémoire…",
        (err as Error).message
      );
    }
  }

  const uri = await startMemoryServer();
  await mongoose.connect(uri);
  return "MongoDB en mémoire démarré (données non persistées)";
}

async function startMemoryServer(): Promise<string> {
  // Imported lazily so production builds without the dev dependency still start.
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const server = await MongoMemoryServer.create({
    instance: { dbName: "cyberace" },
  });
  memoryServer = server;
  return server.getUri();
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

function redact(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}
