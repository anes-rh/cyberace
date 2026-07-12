import { Router } from "express";
import { startSandbox, stopSandbox, statusSandbox } from "../controllers/sandboxController";
import { authRequired } from "../middleware/auth";

const router = Router();

router.post("/:courseSlug/start", authRequired, startSandbox);
router.post("/:courseSlug/stop", authRequired, stopSandbox);
router.get("/:courseSlug/status", authRequired, statusSandbox);

export default router;
