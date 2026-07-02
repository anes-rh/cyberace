import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/db";
import { env } from "./config/env";
import { Course } from "./models/Course";
import { runSeed } from "./data/seed";

async function bootstrap() {
  const dbMessage = await connectDatabase();
  console.log(`[db] ${dbMessage}`);

  if (env.autoSeed) {
    const count = await Course.estimatedDocumentCount();
    if (count === 0) {
      console.log("[seed] Base vide — insertion du contenu CyberAce…");
      const summary = await runSeed({ reset: false });
      console.log(`[seed] ${summary.courses} courses, ${summary.challenges} challenges insérés.`);
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
