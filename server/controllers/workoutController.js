import OnboardingProfile from "../models/OnboardingProfile.js";
import TodoItem from "../models/TodoItem.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import generateWorkoutPlan from "../services/generateWorkoutPlan.js";

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
    const profile = await OnboardingProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(400).json({ message: "Complete onboarding before generating a workout plan." });
    }

    const generated = await generateWorkoutPlan(profile);

    await WorkoutPlan.deleteMany({ userId: req.user._id });
    await TodoItem.deleteMany({ userId: req.user._id });

    const savedPlan = await WorkoutPlan.create({
      userId: req.user._id,
      planName: generated.planName,
      goal: profile.goal,
      environment: profile.environment,
      durationWeeks: profile.durationWeeks,
      generatedAt: new Date(),
      weeks: generated.weeks
    });

    await seedTodosFromPlan(req.user._id, savedPlan);

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
