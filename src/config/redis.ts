import Redis from "ioredis";
import { logger } from "../utils/logger";

if (!process.env.REDIS_URL) {
  console.warn(
    "REDIS_URL environment variable is not set. Falling back to redis://localhost:6379. " +
      "Make sure REDIS_URL is configured in your Railway service variables."
  );
}

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Log the connection target without leaking credentials.
const safeRedisUrl = redisUrl.includes("@")
  ? redisUrl.split("@")[redisUrl.split("@").length - 1]
  : redisUrl;
console.log("Redis URL set to:", safeRedisUrl);

export const redisClient = new Redis(redisUrl, {
  // Railway's managed Redis can take a moment to accept connections after
  // deploy, so retry with backoff instead of failing fast.
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 500, 5000);
    return delay;
  },
  connectTimeout: 10000
});

redisClient.on("connect", () => {
  logger.info(`Redis client connected successfully to ${safeRedisUrl}`);
});

redisClient.on("error", err => {
  console.error("Redis Client Error:", err);
});

export default redisClient;
