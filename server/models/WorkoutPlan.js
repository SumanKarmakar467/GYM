import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number, default: 3 },
    reps: { type: String, required: true },
    rest: { type: String, default: "60s" },
    notes: { type: String, default: "" }
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    dayName: { type: String, required: true },
    focus: { type: String, required: true },
    isRestDay: { type: Boolean, default: false },
    warmup: { type: String, default: "" },
    exercises: { type: [exerciseSchema], default: [] },
    cooldown: { type: String, default: "" }
  },
  { _id: false }
);

const weekSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    theme: { type: String, default: "" },
    days: { type: [daySchema], default: [] }
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planName: { type: String, required: true },
    goal: { type: String, required: true },
    level: { type: String, default: "" },
    daysPerWeek: { type: String, default: "" },
    durationLabel: { type: String, default: "" },
    equipment: { type: String, default: "" },
    environment: { type: String, required: true },
    durationWeeks: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
    weeks: { type: [weekSchema], default: [] }
  },
  { timestamps: true, versionKey: false }
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;
