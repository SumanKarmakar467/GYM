import express from "express";
import { generatePlan, getMyPlan } from "../controllers/workoutController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.post("/generate", protect, generatePlan);
router.get("/me", protect, getMyPlan);

export default router;
