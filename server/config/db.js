import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  const uriPath = new URL(process.env.MONGO_URI).pathname.replace(/^\/+/, "");
  const dbName = process.env.MONGO_DB_NAME || (uriPath ? undefined : "gymforge");

  await mongoose.connect(process.env.MONGO_URI, {
    ...(dbName ? { dbName } : {}),
    serverSelectionTimeoutMS: 5000
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
};

export default connectDB;
