import express from "express";
import { completeOnboarding, login, logout, me, register } from "../controllers/authController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", logout);
router.post("/onboarding", protect, completeOnboarding);
router.put("/onboarding", protect, completeOnboarding);

export default router;
