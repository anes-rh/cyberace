import dotenv from "dotenv";

dotenv.config();

/**
 * Centralised, typed access to environment configuration.
 * Validation happens here, at the system boundary.
 */
export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigins: (process.env.CLIENT_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI?.trim() || "",
  useMemoryDb: (process.env.USE_MEMORY_DB ?? "false").toLowerCase() === "true",
  jwtSecret: process.env.JWT_SECRET || "change-me-cyberace-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  autoSeed: (process.env.AUTO_SEED ?? "true").toLowerCase() === "true",
  isProd: process.env.NODE_ENV === "production",
};

if (env.isProd && env.jwtSecret === "change-me-cyberace-dev-secret") {
  // Fail loudly rather than shipping a known secret to production.
  throw new Error(
    "JWT_SECRET must be set to a strong value in production (NODE_ENV=production)."
  );
}
