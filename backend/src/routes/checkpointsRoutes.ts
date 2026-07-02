import { Router } from "express";
import { listCheckpoints, getCheckpoint } from "../controllers/checkpointsController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, listCheckpoints);
router.get("/:slug", optionalAuth, getCheckpoint);

export default router;
