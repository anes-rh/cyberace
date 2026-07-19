import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

/**
 * Rejette la requête si l'utilisateur courant n'est pas administrateur.
 * À utiliser APRÈS `authRequired` dans la chaîne de middlewares : il dépend de
 * `req.userId` déjà posé par l'authentification. La vérification de rôle est
 * TOUJOURS server-side (le check frontend n'est qu'un confort d'affichage).
 */
export async function adminRequired(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await User.findById(req.userId).select("role").lean();
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Accès administrateur requis." });
    return;
  }
  next();
}
