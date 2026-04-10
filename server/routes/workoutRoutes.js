import express from "express";
import { deleteMyPlan, generatePlan, getMyPlan } from "../controllers/workoutController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect);
router.post("/generate", generatePlan);
router.get("/me", getMyPlan);
router.delete("/me", deleteMyPlan);

export default router;