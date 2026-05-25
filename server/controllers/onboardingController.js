import OnboardingProfile from "../models/OnboardingProfile.js";
import { recordActivity } from "../services/activityService.js";

const validGoals = ["bodybuilder", "calisthenics", "powerlifter", "crossfit", "athlete"];
const validGenders = ["male", "female", "other"];
const validEnvironments = ["gym", "home"];
const validDurations = [4, 8, 12, 24];
const validDietPreferences = ["veg", "non-veg"];

const normalizePayload = (body = {}) => ({
  age: Number(body.age),
  weightKg: Number(body.weightKg),
  heightCm: Number(body.heightCm),
  gender: String(body.gender || "").toLowerCase(),
  goal: String(body.goal || "").toLowerCase(),
  environment: String(body.environment || "").toLowerCase(),
  durationWeeks: Number(body.durationWeeks),
  dietPreference: String(body.dietPreference || "veg").toLowerCase()
});

const getProfileValidationErrors = (payload) => {
  const errors = [];

  if (!Number.isFinite(payload.age) || payload.age < 13 || payload.age > 100) {
    errors.push("Age must be between 13 and 100.");
  }

  if (!Number.isFinite(payload.weightKg) || payload.weightKg < 20 || payload.weightKg > 500) {
    errors.push("Weight must be between 20kg and 500kg.");
  }

  if (!Number.isFinite(payload.heightCm) || payload.heightCm < 120 || payload.heightCm > 260) {
    errors.push("Height must be between 120cm and 260cm.");
  }

  if (!validGenders.includes(payload.gender)) {
    errors.push("Gender must be one of: male, female, other.");
  }

  if (!validGoals.includes(payload.goal)) {
    errors.push("Goal is invalid.");
  }

  if (!validEnvironments.includes(payload.environment)) {
    errors.push("Environment must be gym or home.");
  }

  if (!validDurations.includes(payload.durationWeeks)) {
    errors.push("Duration must be 4, 8, 12, or 24 weeks.");
  }

  if (!validDietPreferences.includes(payload.dietPreference)) {
    errors.push("Diet preference must be veg or non-veg.");
  }

  return errors;
};

export const saveOnboardingProfile = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const errors = getProfileValidationErrors(payload);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Invalid onboarding payload.",
        errors
      });
    }

    const profile = await OnboardingProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        ...payload
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!req.user.isOnboarded) {
      req.user.isOnboarded = true;
    }
    req.user.dietPreference = payload.dietPreference;
    await req.user.save();

    await recordActivity(req.user._id, "onboarding_saved", "Saved onboarding profile.", {
      goal: payload.goal,
      environment: payload.environment,
      durationWeeks: payload.durationWeeks,
      dietPreference: payload.dietPreference
    });

    return res.json(profile);
  } catch {
    return res.status(500).json({ message: "Failed to save onboarding profile." });
  }
};

export const getMyOnboardingProfile = async (req, res) => {
  try {
    const profile = await OnboardingProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.json(null);
    }

    return res.json(profile);
  } catch {
    return res.status(500).json({ message: "Failed to fetch onboarding profile." });
  }
};
