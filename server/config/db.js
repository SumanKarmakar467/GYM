import dns from "node:dns";
import mongoose from "mongoose";

const configureMongoSrvDns = () => {
  if (!process.env.MONGO_URI?.startsWith("mongodb+srv://")) {
    return;
  }

  const configuredServers = String(process.env.MONGO_DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  const currentServers = dns.getServers();
  const shouldUseFallback =
    configuredServers.length > 0 ||
    (process.env.NODE_ENV !== "production" && currentServers.length > 0 && currentServers.every((server) => server.startsWith("127.")));

  if (!shouldUseFallback) {
    return;
  }

  dns.setServers(configuredServers.length > 0 ? configuredServers : ["1.1.1.1", "8.8.8.8"]);
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  configureMongoSrvDns();

  const uriBeforeQuery = process.env.MONGO_URI.split("?")[0];
  const hostPathStart = uriBeforeQuery.indexOf("/", uriBeforeQuery.indexOf("://") + 3);
  const uriPath = hostPathStart >= 0 ? uriBeforeQuery.slice(hostPathStart + 1) : "";
  const dbName = process.env.MONGO_DB_NAME || (uriPath ? undefined : "gymforge");

  await mongoose.connect(process.env.MONGO_URI, {
    ...(dbName ? { dbName } : {}),
    serverSelectionTimeoutMS: 5000
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
};

export default connectDB;
