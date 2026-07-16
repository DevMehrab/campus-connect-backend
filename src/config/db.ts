import mongoose from "mongoose";
import { config } from "./index";
import { errorLogger, logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(config.db.uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    errorLogger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  errorLogger.error("MongoDB disconnected! Attempting to reconnect...");
});
