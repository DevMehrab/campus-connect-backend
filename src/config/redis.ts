import Redis from "ioredis";
import { logger } from "../utils/logger";

const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redisClient.on("connect", () => {
  logger.info("Redis client connected successfully");
});

redisClient.on("error", err => {
  console.error("Redis Client Error:", err);
});

export default redisClient;
