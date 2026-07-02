import { Router } from "express";
import { listLabs, getLab, unlockHint, submitAnswer } from "../controllers/challengesController";
import { authRequired, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, listLabs);
router.get("/:challengeId", optionalAuth, getLab);
router.post("/:challengeId/hint", authRequired, unlockHint);
router.post("/:challengeId/submit", authRequired, submitAnswer);

export default router;
