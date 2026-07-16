import app from "./app";
import { createServer } from "http";
import { connectDB } from "./config/db";
import { config } from "./config/index";
import { logger, errorLogger } from "./utils/logger";
import "./config/redis";
import "./jobs/email.worker";
import { initSocket } from "./config/socket";

const startServer = async () => {
  await connectDB();

  const httpServer = createServer(app);

  initSocket(httpServer);

  const server = httpServer.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    logger.info(`Socket server is ready for connections!`);
  });

  process.on("unhandledRejection", (err: Error) => {
    errorLogger.error(`Unhandled Rejection: ${err.message}`);
    logger.info("Shutting down server safely...");
    server.close(() => {
      process.exit(1);
    });
  });

  process.on("uncaughtException", (err: Error) => {
    errorLogger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
};

startServer();
