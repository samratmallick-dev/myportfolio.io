import mongoose from "mongoose";
import Logger from "../logger/logger.config.js";

const url = process.env.MONGO_URL;
const name = process.env.MONGO_NAME;

if (!(url && name)) {
  console.error("Please provide MONGO_URL and MONGO_NAME in the environment variables");
  Logger.error("Please provide MONGO_URL and MONGO_NAME in the environment variables");
  throw new Error("Please provide MONGO_URL and MONGO_NAME in the environment variables");
}

const connectDb = async () => {
  try {
    const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE || "10", 10);
    const minPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE || "2", 10);
    
    const [base, query] = url.split("?");
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const mongoUri = query ? `${cleanBase}/${name}?${query}` : `${cleanBase}/${name}`;
    const connection = await mongoose.connect(mongoUri, {
      maxPoolSize,
      minPoolSize,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${connection.connection.host} (pool: ${minPoolSize}-${maxPoolSize})`);
    Logger.info(`MongoDB connected: ${connection.connection.host} (pool: ${minPoolSize}-${maxPoolSize})`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    Logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

export default connectDb;