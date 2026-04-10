import express from "express";
import { getOnboardingMedia, getWorkoutDemos } from "../controllers/mediaController.js";

const router = express.Router();

router.get("/onboarding", getOnboardingMedia);
router.get("/workout-demos", getWorkoutDemos);

export default router;
