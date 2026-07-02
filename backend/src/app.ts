import express from "express";
import cors from "cors";
import { env } from "./config/env";
import apiRouter from "./routes";
import { notFound, errorHandler } from "./middleware/error";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin/no-origin tools (curl, Postman) and whitelisted clients.
        if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origine non autorisée: ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "256kb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
