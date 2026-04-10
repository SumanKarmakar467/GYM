import express from "express";
import { getMyOnboardingProfile, saveOnboardingProfile } from "../controllers/onboardingController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect);
router.post("/", saveOnboardingProfile);
router.get("/me", getMyOnboardingProfile);

export default router;