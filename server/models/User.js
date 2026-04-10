import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, default: null, index: true },
    avatar: { type: String, default: "" },
    isOnboarded: { type: Boolean, default: false },
    refreshToken: { type: String, default: null, select: false },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;
