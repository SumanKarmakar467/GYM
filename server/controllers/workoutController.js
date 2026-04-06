import WorkoutPlan from "../models/WorkoutPlan.js";
import generateWorkoutPlan from "../services/generateWorkoutPlan.js";

const requiredTextFields = ["gender", "goal", "location", "level"];
const allowedGoals = [
  "Aesthetic",
  "Bodybuilder",
  "Fat Loss",
  "Maintain Health",
  "Strength & Power",
  "Functional Fitness"
];
const allowedLocations = ["Home", "Gym"];
const allowedLevels = ["Beginner", "Intermediate", "Advanced"];
const allowedGenders = ["Male", "Female", "Other"];

const toFinitePositiveNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const hasValidTextFields = (payload) =>
  requiredTextFields.every(
    (field) => payload[field] !== undefined && payload[field] !== null && payload[field] !== ""
  );

const parseIncomingPayload = (body = {}) => ({
  height: toFinitePositiveNumber(body.height),
  weight: toFinitePositiveNumber(body.weight),
  age: toFinitePositiveNumber(body.age),
  gender: body.gender,
  goal: body.goal,
  location: body.location,
  level: body.level
});

const hasValidPayload = (payload) =>
  hasValidTextFields(payload) &&
  payload.height !== null &&
  payload.weight !== null &&
  payload.age !== null &&
  allowedGenders.includes(payload.gender) &&
  allowedGoals.includes(payload.goal) &&
  allowedLocations.includes(payload.location) &&
  allowedLevels.includes(payload.level);

export const generatePlan = async (req, res) => {
  try {
    const incoming = parseIncomingPayload(req.body);

    if (!hasValidPayload(incoming)) {
      return res.status(400).json({ message: "All onboarding fields are required." });
    }

    req.user.height = incoming.height;
    req.user.weight = incoming.weight;
    req.user.age = incoming.age;
    req.user.gender = incoming.gender;
    req.user.goal = incoming.goal;
    req.user.location = incoming.location;
    req.user.level = incoming.level;
    req.user.onboardingComplete = true;
    await req.user.save();

    const weekPlan = await generateWorkoutPlan(incoming);

    const plan = await WorkoutPlan.create({
      userId: req.user._id,
      goal: incoming.goal,
      location: incoming.location,
      level: incoming.level,
      weekPlan
    });

    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate workout plan.", error: error.message });
  }
};

export const getMyPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found." });
    }

    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch workout plan.", error: error.message });
  }
};
