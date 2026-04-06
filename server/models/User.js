import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    age: { type: Number, default: null },
    gender: { type: String, default: "" },
    goal: {
      type: String,
      enum: [
        "Aesthetic",
        "Bodybuilder",
        "Fat Loss",
        "Maintain Health",
        "Strength & Power",
        "Functional Fitness"
      ],
      default: null
    },
    location: {
      type: String,
      enum: ["Home", "Gym"],
      default: null
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: null
    },
    onboardingComplete: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;
