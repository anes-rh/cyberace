/**
 * Manual sandbox cleanup — `npm run sandbox:prune`.
 * Destroys every Docker resource labelled `com.cyberace.managed=true` and marks
 * lingering Mongo sessions as stopped. Handy when the dev server crashed without
 * going through the boot-time prune.
 */
import { connectDatabase, disconnectDatabase } from "../src/config/db";
import { pruneOrphans } from "../src/services/dockerSandbox";

(async () => {
  const message = await connectDatabase();
  console.log(`[db] ${message}`);
  await pruneOrphans();
  await disconnectDatabase();
  process.exit(0);
})().catch((err) => {
  console.error("[sandbox:prune] Échec:", err);
  process.exit(1);
});
