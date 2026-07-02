import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

/** Rejects the request when no valid bearer token is present. */
export function authRequired(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Authentification requise." });
    return;
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Session invalide ou expirée." });
  }
}

/** Attaches the user id when a token is present, but never blocks the request. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    try {
      req.userId = verifyToken(token).sub;
    } catch {
      /* ignore invalid token for public endpoints */
    }
  }
  next();
}
