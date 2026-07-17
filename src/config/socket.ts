import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../utils/logger";

let io: SocketIOServer;

const userSocketMap = new Map<string, string>();

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", socket => {
    logger.info(`New client connected: ${socket.id}`);

    const userId = socket.handshake.query.userId as string;

    if (userId && userId !== "undefined") {
      userSocketMap.set(userId, socket.id);
      logger.info(`User ${userId} mapped to socket ${socket.id}`);
    } else {
      logger.warn(`Client connected without a valid userId: ${socket.id}`);
    }

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);

      if (userId) {
        userSocketMap.delete(userId);
      }
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap.get(receiverId);
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
