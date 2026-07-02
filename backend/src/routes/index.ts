import { Router } from "express";
import authRoutes from "./authRoutes";
import coursesRoutes from "./coursesRoutes";
import labsRoutes from "./labsRoutes";
import leaderboardRoutes from "./leaderboardRoutes";
import progressRoutes from "./progressRoutes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    name: "CyberAce API",
    version: "1.0.0",
    endpoints: ["/auth", "/courses", "/labs", "/leaderboard", "/progress"],
  });
});

router.use("/auth", authRoutes);
router.use("/courses", coursesRoutes);
router.use("/labs", labsRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/progress", progressRoutes);

export default router;
