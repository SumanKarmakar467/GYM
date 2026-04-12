import WallpaperConfig from "../models/WallpaperConfig.js";

const quotePool = [
  "No shortcuts. Just work.",
  "Earn your progress, one rep at a time.",
  "Discipline beats motivation.",
  "You are one set away from a different life.",
  "Consistency forges champions.",
  "Built in silence. Proven in performance."
];

const validStyles = ["Dark", "Minimal", "Fire"];

export const getWallpaperConfig = async (req, res) => {
  try {
    const config = await WallpaperConfig.findOne({ userId: req.user._id });
    return res.json(config || null);
  } catch {
    return res.status(500).json({ message: "Failed to fetch wallpaper config." });
  }
};

export const saveWallpaperConfig = async (req, res) => {
  try {
    const quote = String(req.body?.quote || "").trim();
    const style = String(req.body?.style || "Dark").trim();

    if (!quote) {
      return res.status(400).json({ message: "Quote is required." });
    }

    if (!validStyles.includes(style)) {
      return res.status(400).json({ message: "Style is invalid." });
    }

    const config = await WallpaperConfig.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, quote, style },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json(config);
  } catch {
    return res.status(500).json({ message: "Failed to save wallpaper config." });
  }
};

export const getRandomQuote = async (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotePool.length);
  return res.json({ quote: quotePool[randomIndex] });
};
