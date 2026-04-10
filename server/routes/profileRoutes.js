import express from "express";
import { getMeProfile, updateMeProfile } from "../controllers/profileController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect);
router.get("/me", getMeProfile);
router.patch("/me", updateMeProfile);

export default router;