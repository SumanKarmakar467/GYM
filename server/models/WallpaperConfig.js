import mongoose from "mongoose";
import { createHybridModel } from "../utils/localModel.js";

const wallpaperConfigSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quote: { type: String, default: "" },
    style: { type: String, default: "Dark" }
  },
  { timestamps: true, versionKey: false }
);

wallpaperConfigSchema.index({ userId: 1 }, { unique: true });

const WallpaperConfig = createHybridModel(mongoose.model("WallpaperConfig", wallpaperConfigSchema), "wallpaper-configs", {
  quote: "",
  style: "Dark"
});

export default WallpaperConfig;
