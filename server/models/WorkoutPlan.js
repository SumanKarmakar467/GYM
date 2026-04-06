import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    muscle: { type: String, required: true },
    sets: { type: String, required: true },
    reps: { type: String, required: true },
    rest: { type: String, required: true }
  },
  { _id: false }
);

const dayPlanSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    name: { type: String, required: true },
    muscles: { type: String, required: true },
    exercises: { type: [exerciseSchema], default: [] }
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    goal: { type: String, required: true },
    location: { type: String, required: true },
    level: { type: String, required: true },
    weekPlan: { type: [dayPlanSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;
