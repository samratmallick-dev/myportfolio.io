import mongoose from "mongoose";

if (!process.env.MONGO_URL) {
  throw new Error("MONGO_URL is not defined in the environment variables");
}

export const connectDb = async () => {
  const url = `${process.env.MONGO_URL}/${process.env.MONGO_NAME}`;
  try {
    const connect = await mongoose.connect(url, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB host:", connect.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}; 