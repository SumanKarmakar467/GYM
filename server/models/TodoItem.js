import mongoose from "mongoose";

const todoItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    date: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const TodoItem = mongoose.model("TodoItem", todoItemSchema);

export default TodoItem;
