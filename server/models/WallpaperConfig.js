import mongoose from "mongoose";

const wallpaperConfigSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quote: { type: String, default: "" },
    style: { type: String, default: "Dark" }
  },
  { timestamps: true, versionKey: false }
);

wallpaperConfigSchema.index({ userId: 1 }, { unique: true });

const WallpaperConfig = mongoose.model("WallpaperConfig", wallpaperConfigSchema);

export default WallpaperConfig;
