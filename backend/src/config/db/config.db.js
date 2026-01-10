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
    const connection = await mongoose.connect(`${url}/${name}`);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    Logger.info(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    Logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}

export default connectDb;