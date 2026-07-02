import { Router } from "express";
import { getProgress, getAttempts } from "../controllers/progressController";
import { authRequired } from "../middleware/auth";

const router = Router();

router.get("/", authRequired, getProgress);
router.get("/attempts", authRequired, getAttempts);

export default router;
