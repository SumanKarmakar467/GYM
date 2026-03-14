import WorkoutPlan from "../models/WorkoutPlan.js";
import generateWorkoutPlan from "../services/generateWorkoutPlan.js";

export const generatePlan = async (req, res) => {
  try {
    const plan = generateWorkoutPlan(req.user);
    const saved = await WorkoutPlan.findOneAndUpdate(
      { userId: req.user._id },
      { weeklySchedule: plan.weeklySchedule },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: "Workout generation failed.", error: error.message });
  }
};

export const getMyPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ userId: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found." });
    }
    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch workout plan.", error: error.message });
  }
};
