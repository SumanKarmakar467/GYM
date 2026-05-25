import mongoose from "mongoose";
import { createHybridModel } from "../utils/localModel.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, default: null, index: true },
    avatar: { type: String, default: "" },
    dietPreference: { type: String, enum: ["veg", "non-veg"], default: "veg" },
    isOnboarded: { type: Boolean, default: false },
    refreshToken: { type: String, default: null, select: false },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const User = createHybridModel(mongoose.model("User", userSchema), "users", {
  role: "user",
  googleId: null,
  avatar: "",
  dietPreference: "veg",
  isOnboarded: false,
  refreshToken: null
});

export default User;
