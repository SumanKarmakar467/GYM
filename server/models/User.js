import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    age: { type: Number, required: true, min: 10, max: 100 },
    weight: { type: Number, required: true, min: 20 },
    height: { type: Number, required: true, min: 80 },
    goal: {
      type: String,
      required: true,
      enum: ["athlete", "bodybuilder", "weight_loss", "maintain_health", "flexibility"]
    },
    workoutLocation: { type: String, required: true, enum: ["home", "gym"] },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

const User = mongoose.model("User", userSchema);
export default User;
