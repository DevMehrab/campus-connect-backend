import { Queue } from "bullmq";
import { logger } from "../utils/logger";
import redisClient from "../config/redis";

export const emailQueue = new Queue("email-queue", {
  connection: redisClient as unknown as any,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

export const addWelcomeEmailJob = async (userEmail: string, userName: string) => {
  await emailQueue.add("send-welcome-email", {
    email: userEmail,
    name: userName
  });
  logger.info(`Added email job to queue for ${userEmail}`);
};
