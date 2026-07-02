import { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Ressource introuvable." });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Mongoose duplicate key
  const anyErr = err as { code?: number; keyValue?: Record<string, unknown>; name?: string; message?: string };
  if (anyErr?.code === 11000) {
    const field = Object.keys(anyErr.keyValue ?? {})[0] ?? "champ";
    res.status(409).json({ error: `Ce ${field} est déjà utilisé.` });
    return;
  }
  if (anyErr?.name === "ValidationError") {
    res.status(400).json({ error: anyErr.message ?? "Données invalides." });
    return;
  }

  console.error("[error]", err);
  res.status(500).json({ error: "Erreur interne du serveur." });
}
