import mongoose from "mongoose";
import { createHybridModel } from "../utils/localModel.js";

const onboardingProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number, required: true, min: 13, max: 100 },
    weightKg: { type: Number, required: true, min: 20, max: 500 },
    heightCm: { type: Number, required: true, min: 120, max: 260 },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    goal: {
      type: String,
      enum: ["bodybuilder", "calisthenics", "powerlifter", "crossfit", "athlete"],
      required: true
    },
    environment: { type: String, enum: ["gym", "home"], required: true },
    durationWeeks: { type: Number, enum: [4, 8, 12, 24], required: true }
  },
  { timestamps: true, versionKey: false }
);

const OnboardingProfile = createHybridModel(mongoose.model("OnboardingProfile", onboardingProfileSchema), "onboarding-profiles");

export default OnboardingProfile;
