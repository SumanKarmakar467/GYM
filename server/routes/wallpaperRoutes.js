import express from "express";
import { getWallpaperConfig, saveWallpaperConfig } from "../controllers/wallpaperController.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.use(protect);
router.get("/", getWallpaperConfig);
router.post("/", saveWallpaperConfig);

export default router;
