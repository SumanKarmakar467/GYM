import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI);
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
};

export default connectDB;
