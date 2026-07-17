import { Router } from "express";
import { authRequired, optionalAuth } from "../middleware/auth";
import {
  listProjects,
  getProject,
  startProjectSessionCtrl,
  stopProjectSessionCtrl,
  getProjectSession,
  getProjectLogs,
  getProjectObjectives,
  getObjectiveHints,
  validateProjectObjective,
  getProjectSolution,
} from "../controllers/projectsController";

const router = Router();

// Auth optionnelle : liste/détail lisibles sans compte, enrichis si connecté.
router.get("/", optionalAuth, listProjects);
router.get("/:slug", optionalAuth, getProject);

// Session (auth requise).
router.post("/:slug/session/start", authRequired, startProjectSessionCtrl);
router.post("/:slug/session/stop", authRequired, stopProjectSessionCtrl);
router.get("/:slug/session", authRequired, getProjectSession);
router.get("/:slug/session/logs", authRequired, getProjectLogs);

// Objectifs (auth requise).
router.get("/:slug/objectives", authRequired, getProjectObjectives);
router.get("/:slug/objectives/:objectiveId/hints", authRequired, getObjectiveHints);
router.post("/:slug/objectives/:objectiveId/validate", authRequired, validateProjectObjective);
router.get("/:slug/solution", authRequired, getProjectSolution);

export default router;
