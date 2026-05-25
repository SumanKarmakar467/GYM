import express from "express";
import { getDietPlan, updateDietLog } from "../controllers/dietController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect);
router.get("/", getDietPlan);
router.patch("/log", updateDietLog);

export default router;
