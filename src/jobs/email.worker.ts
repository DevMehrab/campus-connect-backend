import { Worker } from "bullmq";
import { sendEmail } from "../utils/mailer";
import { logger } from "../utils/logger";
import redisClient from "../config/redis";

export const emailWorker = new Worker(
  "email-queue",
  async job => {
    const { email, username } = job.data;

    logger.info(`Sending welcome email to ${email}...`);

    const htmlTemplate = `
      <div>
        <h1>Welcome to the Campus App, ${username}!</h1>
        <p>We are thrilled to have you on board. Start compiling your thoughts on the feed today.</p>
      </div>
    `;

    await sendEmail(email, "Welcome to Campus App!", htmlTemplate);

    logger.info(`Successfully sent welcome email to ${email}!`);
  },
  {
    connection: redisClient as unknown as any
  }
);

emailWorker.on("failed", (job, err) => {
  if (job) {
    if (job.attemptsMade < (job.opts.attempts || 1)) {
      logger.warn(`Job ${job.id} failed (Attempt ${job.attemptsMade}). Retrying...`);
    } else {
      logger.error(
        `Job ${job.id} PERMANENTLY failed after ${job.attemptsMade} attempts: ${err.message}`
      );
    }
  }
});
