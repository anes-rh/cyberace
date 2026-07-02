import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { env } from "./config/env";
import { Course } from "./models/Course";
import { Checkpoint } from "./models/Checkpoint";
import { runSeed } from "./data/seed";

async function bootstrap() {
  const dbMessage = await connectDatabase();
  console.log(`[db] ${dbMessage}`);

  if (env.autoSeed) {
    const [courseCount, checkpointCount] = await Promise.all([
      Course.estimatedDocumentCount(),
      Checkpoint.estimatedDocumentCount(),
    ]);
    // Seed when the DB is fresh OR when an iteration-1 DB has no checkpoints yet
    // (runSeed upserts idempotently and backfills the course.checkpoint field).
    if (courseCount === 0 || checkpointCount === 0) {
      console.log("[seed] Insertion / mise à jour du contenu CyberAce…");
      const summary = await runSeed({ reset: false });
      console.log(
        `[seed] ${summary.checkpoints} checkpoints, ${summary.courses} courses, ${summary.challenges} challenges.`
      );
    }
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[api] CyberAce API en écoute sur http://localhost:${env.port}`);
    console.log(`[api] CORS autorisé pour: ${env.clientOrigins.join(", ")}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[api] ${signal} reçu, arrêt en cours…`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("[api] Échec du démarrage:", err);
  process.exit(1);
});
