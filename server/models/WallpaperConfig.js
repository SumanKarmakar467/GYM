import mongoose from "mongoose";

const wallpaperConfigSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    selectedTodos: [{ type: mongoose.Schema.Types.ObjectId, ref: "TodoItem" }],
    theme: {
      type: String,
      enum: ["Dark Motivational", "Minimal White", "Neon Gym", "Nature Calm"],
      default: "Dark Motivational"
    },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const WallpaperConfig = mongoose.model("WallpaperConfig", wallpaperConfigSchema);
export default WallpaperConfig;
