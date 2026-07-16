import { Worker } from "bullmq";
import { sendEmail } from "../utils/mailer";
import { logger } from "../utils/logger";

const connection = {
  host: "127.0.0.1",
  port: 6380
};

export const emailWorker = new Worker(
  "email-queue",
  async job => {
    const { email, name } = job.data;

    logger.info(`Sending welcome email to ${email}...`);

    const htmlTemplate = `
      
        Welcome to the Campus App, ${name}!
        We are thrilled to have you on board. Start compiling your thoughts on the feed today.
      
    `;

    await sendEmail(email, "Welcome to Campus App!", htmlTemplate);

    logger.info(`Successfully sent welcome email to ${email}!`);
  },
  { connection }
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
