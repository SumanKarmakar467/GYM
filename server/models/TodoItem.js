import mongoose from "mongoose";
import { createHybridModel } from "../utils/localModel.js";

const todoItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    weekNum: { type: Number, required: true },
    dayNum: { type: Number, required: true },
    exerciseId: { type: String, required: true },
    exerciseName: { type: String, required: true },
    exerciseIndex: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true, versionKey: false }
);

todoItemSchema.index({ userId: 1, date: 1 });

const TodoItem = createHybridModel(mongoose.model("TodoItem", todoItemSchema), "todo-items", {
  completed: false,
  completedAt: null
});

export default TodoItem;
