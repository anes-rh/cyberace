import { Router } from "express";
import { register, login, me, updateProfile, updatePassword } from "../controllers/authController";
import { authRequired } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, me);
router.patch("/profile", authRequired, updateProfile);
router.patch("/password", authRequired, updatePassword);

export default router;
