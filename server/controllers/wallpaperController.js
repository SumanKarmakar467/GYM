import WallpaperConfig from "../models/WallpaperConfig.js";

export const getWallpaperConfig = async (req, res) => {
  try {
    const config = await WallpaperConfig.findOne({ userId: req.user._id }).populate("selectedTodos");
    if (!config) return res.json(null);
    return res.json(config);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch wallpaper config.", error: error.message });
  }
};

export const saveWallpaperConfig = async (req, res) => {
  try {
    const { selectedTodos = [], theme = "Dark Motivational" } = req.body;
    const saved = await WallpaperConfig.findOneAndUpdate(
      { userId: req.user._id },
      { selectedTodos, theme, generatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save wallpaper config.", error: error.message });
  }
};
