import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment variables.");
  }
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
};

export default connectDB;
