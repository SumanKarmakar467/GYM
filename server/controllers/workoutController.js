import OnboardingProfile from "../models/OnboardingProfile.js";
import TodoItem from "../models/TodoItem.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import generateWorkoutPlan from "../services/generateWorkoutPlan.js";

const validGoals = ["Burn Fat", "Build Muscle", "Improve Endurance"];
const validLevels = ["Beginner", "Intermediate", "Advanced"];
const validDurationLabels = ["1 week", "1 month", "3 months", "6 months"];
const validEquipment = ["Full Gym", "Home Gym", "Bodyweight Only"];

const legacyGoalMap = {
  bodybuilder: "Build Muscle",
  calisthenics: "Build Muscle",
  powerlifter: "Build Muscle",
  crossfit: "Improve Endurance",
  athlete: "Burn Fat"
};

const legacyEquipmentMap = {
  gym: "Full Gym",
  home: "Home Gym"
};

const goalToLegacy = {
  "Build Muscle": "bodybuilder",
  "Burn Fat": "athlete",
  "Improve Endurance": "crossfit"
};

const equipmentToLegacyEnvironment = {
  "Full Gym": "gym",
  "Home Gym": "home",
  "Bodyweight Only": "home"
};

const weeksToDurationLabel = {
  1: "1 week",
  4: "1 month",
  12: "3 months",
  24: "6 months"
};

const durationLabelToWeeks = {
  "1 week": 1,
  "1 month": 4,
  "3 months": 12,
  "6 months": 24
};

const extractWorkoutPreferences = (body = {}, legacyProfile = null) => {
  const bodyGoal = String(body.goal || "").trim();
  const bodyLevel = String(body.level || "").trim();
  const bodyDuration = String(body.duration || body.daysPerWeek || "").trim();
  const bodyEquipment = String(body.equipment || "").trim();

  if (bodyGoal || bodyLevel || bodyDuration || bodyEquipment) {
    return {
      goal: bodyGoal,
      level: bodyLevel,
      duration: bodyDuration,
      equipment: bodyEquipment
    };
  }

  if (!legacyProfile) {
    return null;
  }

  return {
    goal: legacyGoalMap[legacyProfile.goal] || "Build Muscle",
    level: "Intermediate",
    duration: weeksToDurationLabel[Number(legacyProfile.durationWeeks)] || "1 month",
    equipment: legacyEquipmentMap[legacyProfile.environment] || "Home Gym"
  };
};

const validateWorkoutPreferences = (preferences = null) => {
  const errors = [];

  if (!preferences) {
    errors.push("Workout preferences are required.");
    return errors;
  }

  if (!validGoals.includes(preferences.goal)) {
    errors.push("Goal is invalid.");
  }

  if (!validLevels.includes(preferences.level)) {
    errors.push("Experience level is invalid.");
  }

  if (!validDurationLabels.includes(preferences.duration)) {
    errors.push("Duration is invalid.");
  }

  if (!validEquipment.includes(preferences.equipment)) {
    errors.push("Equipment access is invalid.");
  }

  return errors;
};

const buildGenerationProfile = (preferences, legacyProfile = null) => {
  const durationWeeks = durationLabelToWeeks[preferences.duration] || Number(legacyProfile?.durationWeeks) || 4;
  const legacyGoal = goalToLegacy[preferences.goal] || "bodybuilder";
  const legacyEnvironment = equipmentToLegacyEnvironment[preferences.equipment] || "home";

  return {
    age: Number(legacyProfile?.age) || 25,
    weightKg: Number(legacyProfile?.weightKg) || 70,
    heightCm: Number(legacyProfile?.heightCm) || 170,
    gender: String(legacyProfile?.gender || "other"),
    goal: legacyGoal,
    environment: legacyEnvironment,
    durationWeeks,
    level: preferences.level,
    duration: preferences.duration,
    equipment: preferences.equipment,
    publicGoal: preferences.goal
  };
};

const formatDateYmd = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const seedTodosFromPlan = async (userId, plan) => {
  const todos = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  plan.weeks.forEach((week, weekIndex) => {
    week.days.forEach((day, dayIndex) => {
      if (day.isRestDay || !Array.isArray(day.exercises) || day.exercises.length === 0) {
        return;
      }

      const workoutDate = addDays(startDate, weekIndex * 7 + dayIndex);

      day.exercises.forEach((exercise, exerciseIndex) => {
        todos.push({
          userId,
          date: formatDateYmd(workoutDate),
          weekNum: week.weekNumber,
          dayNum: dayIndex + 1,
          exerciseId: `w${week.weekNumber}-d${dayIndex + 1}-e${exerciseIndex + 1}`,
          exerciseName: exercise.name,
          exerciseIndex: exerciseIndex,
          completed: false,
          completedAt: null
        });
      });
    });
  });

  if (todos.length > 0) {
    await TodoItem.insertMany(todos);
  }
};

export const generatePlan = async (req, res) => {
  try {
    const legacyProfile = await OnboardingProfile.findOne({ userId: req.user._id });
    const preferences = extractWorkoutPreferences(req.body, legacyProfile);
    const validationErrors = validateWorkoutPreferences(preferences);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Invalid workout preferences.",
        errors: validationErrors
      });
    }

    const profile = buildGenerationProfile(preferences, legacyProfile);
    const generated = await generateWorkoutPlan(profile);

    await WorkoutPlan.deleteMany({ userId: req.user._id });
    await TodoItem.deleteMany({ userId: req.user._id });

    const savedPlan = await WorkoutPlan.create({
      userId: req.user._id,
      planName: generated.planName,
      goal: preferences.goal,
      level: preferences.level,
      daysPerWeek: "",
      durationLabel: preferences.duration,
      equipment: preferences.equipment,
      environment: profile.environment,
      durationWeeks: profile.durationWeeks,
      generatedAt: new Date(),
      weeks: generated.weeks
    });

    await seedTodosFromPlan(req.user._id, savedPlan);

    if (!req.user.isOnboarded) {
      req.user.isOnboarded = true;
      await req.user.save();
    }

    return res.status(201).json(savedPlan);
  } catch {
    return res.status(500).json({ message: "Failed to generate workout plan." });
  }
};

export const getMyPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!plan) {
      return res.json(null);
    }

    return res.json(plan);
  } catch {
    return res.status(500).json({ message: "Failed to fetch workout plan." });
  }
};

export const deleteMyPlan = async (req, res) => {
  try {
    await WorkoutPlan.deleteMany({ userId: req.user._id });
    await TodoItem.deleteMany({ userId: req.user._id });

    return res.json({ message: "Workout plan deleted." });
  } catch {
    return res.status(500).json({ message: "Failed to delete workout plan." });
  }
};
