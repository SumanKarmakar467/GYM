import express from "express";
import protect from "../middleware/protect.js";
import {
  getRandomQuote,
  getWallpaperConfig,
  saveWallpaperConfig
} from "../controllers/wallpaperController.js";

const router = express.Router();

router.use(protect);
router.get("/", getWallpaperConfig);
router.post("/", saveWallpaperConfig);
router.get("/quote", getRandomQuote);

export default router;
