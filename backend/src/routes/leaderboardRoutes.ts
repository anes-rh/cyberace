import { Router } from "express";
import { getLeaderboard } from "../controllers/leaderboardController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, getLeaderboard);

export default router;
