import mongoose from "mongoose";
import { createHybridModel } from "../utils/localModel.js";

const dietLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    completedKeys: { type: [String], default: [] }
  },
  { timestamps: true, versionKey: false }
);

dietLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DietLog = createHybridModel(mongoose.model("DietLog", dietLogSchema), "diet-logs", {
  completedKeys: []
});

export default DietLog;
