import { Queue } from "bullmq";
import { logger } from "../utils/logger";

const connection = {
  host: "127.0.0.1",
  port: 6380
};

export const emailQueue = new Queue("email-queue", {
  connection,
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
