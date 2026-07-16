import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../utils/logger";

let io: SocketIOServer;

// Map to track which user has which socket ID
const userSocketMap = new Map<string, string>();

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000", // Safer than "*"
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", socket => {
    logger.info(`New client connected: ${socket.id}`);

    // 🔥 FIX: Automatically register the user from the connection query
    const userId = socket.handshake.query.userId as string;

    if (userId && userId !== "undefined") {
      userSocketMap.set(userId, socket.id);
      logger.info(`User ${userId} mapped to socket ${socket.id}`);
    } else {
      logger.warn(`Client connected without a valid userId: ${socket.id}`);
    }

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);

      // Remove user from map on disconnect
      if (userId) {
        userSocketMap.delete(userId);
      }
    });
  });

  return io;
};

// 🔥 HELPER: Easy way for your controllers to find a user's socket ID
export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap.get(receiverId);
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
