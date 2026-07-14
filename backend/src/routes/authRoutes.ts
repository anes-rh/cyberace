import { Router } from "express";
import { register, login, me, updateProfile, updatePassword } from "../controllers/authController";
import { authRequired } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

// Anti-brute-force sur les points d'entrée non authentifiés.
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authRequired, me);
router.patch("/profile", authRequired, updateProfile);
router.patch("/password", authRequired, updatePassword);

export default router;
