import mongoose from "mongoose";

const todoItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    exerciseName: { type: String, required: true },
    day: { type: String, required: true },
    muscleGroup: { type: String, default: "" },
    sets: { type: Number, default: 0 },
    reps: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

const TodoItem = mongoose.model("TodoItem", todoItemSchema);
export default TodoItem;
