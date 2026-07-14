import { Router } from "express";
import authRoutes from "./authRoutes";
import checkpointsRoutes from "./checkpointsRoutes";
import coursesRoutes from "./coursesRoutes";
import labsRoutes from "./labsRoutes";
import leaderboardRoutes from "./leaderboardRoutes";
import progressRoutes from "./progressRoutes";
import executeRoutes from "./executeRoutes";
import sandboxRoutes from "./sandboxRoutes";
import projectsRoutes from "./projectsRoutes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    name: "CyberAce API",
    version: "1.1.0",
    endpoints: ["/auth", "/checkpoints", "/courses", "/labs", "/leaderboard", "/progress", "/execute", "/sandbox", "/projects"],
  });
});

router.use("/auth", authRoutes);
router.use("/checkpoints", checkpointsRoutes);
router.use("/courses", coursesRoutes);
router.use("/labs", labsRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/progress", progressRoutes);
router.use("/execute", executeRoutes);
router.use("/sandbox", sandboxRoutes);
router.use("/projects", projectsRoutes);

export default router;
