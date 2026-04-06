import bcrypt from "bcryptjs";
import User from "../models/User.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import generateWorkoutPlan from "../services/generateWorkoutPlan.js";
import { clearAuthCookie, setAuthCookie, signAuthToken } from "../utils/auth.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  height: user.height,
  weight: user.weight,
  age: user.age,
  gender: user.gender,
  goal: user.goal,
  location: user.location,
  level: user.level,
  onboardingComplete: user.onboardingComplete,
  createdAt: user.createdAt
});

const onboardingRequiredTextFields = ["gender", "goal", "location", "level"];
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

const parseOnboardingPayload = (body = {}) => ({
  height: toFinitePositiveNumber(body.height),
  weight: toFinitePositiveNumber(body.weight),
  age: toFinitePositiveNumber(body.age),
  gender: body.gender,
  goal: body.goal,
  location: body.location,
  level: body.level
});

const hasCompleteOnboardingPayload = (payload) => {
  const fieldsPresent = onboardingRequiredTextFields.every(
    (field) => payload[field] !== undefined && payload[field] !== null && payload[field] !== ""
  );

  return (
    fieldsPresent &&
    payload.height !== null &&
    payload.weight !== null &&
    payload.age !== null &&
    allowedGenders.includes(payload.gender) &&
    allowedGoals.includes(payload.goal) &&
    allowedLocations.includes(payload.location) &&
    allowedLevels.includes(payload.level)
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash
    });

    const token = signAuthToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed.", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signAuthToken(user._id);
    setAuthCookie(res, token);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
};

export const me = async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
};

export const logout = async (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out successfully." });
};

export const completeOnboarding = async (req, res) => {
  try {
    const incoming = parseOnboardingPayload(req.body);

    if (!hasCompleteOnboardingPayload(incoming)) {
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

    return res.status(201).json({
      message: "Onboarding completed successfully.",
      user: sanitizeUser(req.user),
      plan
    });
  } catch (error) {
    return res.status(500).json({ message: "Onboarding failed.", error: error.message });
  }
};
