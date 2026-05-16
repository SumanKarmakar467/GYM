import mongoose from "mongoose";
import { createHybridModel } from "../utils/localModel.js";

const userActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, required: true, trim: true, index: true },
    message: { type: String, required: true, trim: true },
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  { versionKey: false }
);

const UserActivity = createHybridModel(mongoose.model("UserActivity", userActivitySchema), "userActivities", {
  metadata: {}
});

export default UserActivity;
