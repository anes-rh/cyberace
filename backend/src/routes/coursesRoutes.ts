import { Router } from "express";
import { listCourses, getCourse } from "../controllers/coursesController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, listCourses);
router.get("/:slug", optionalAuth, getCourse);

export default router;
