import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { adminRequired } from "../middleware/adminRequired";
import {
  getStats,
  listUsers,
  getUserDetail,
  changeUserRole,
  resetUserProgress,
  listSessions,
  forceStopSession,
  getFullLeaderboard,
} from "../controllers/adminController";

const router = Router();

// authRequired pose req.userId, adminRequired vérifie le rôle server-side.
// Appliqué à TOUTES les routes admin (jamais adminRequired seul).
router.use(authRequired, adminRequired);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/users/:id", getUserDetail);
router.patch("/users/:id/role", changeUserRole);
router.delete("/users/:id/progress", resetUserProgress);
router.get("/sessions", listSessions);
router.delete("/sessions/:type/:id", forceStopSession);
router.get("/leaderboard", getFullLeaderboard);

export default router;
