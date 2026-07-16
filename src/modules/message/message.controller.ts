import { Request, Response } from "express";
import * as MessageService from "./message.service";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../errors/AppError";

export const sendMessageController = catchAsync(async (req: Request, res: Response) => {
  const senderId = req?.user?.id || req?.user?._id || req?.user?.userId;
  const { receiverId } = req.params;
  const { text } = req.body;
  if (!senderId || senderId === "undefined") {
    throw new AppError(401, "Sender authentication failed. User ID is undefined.");
  }
  if (!receiverId || receiverId === "undefined") {
    throw new AppError(400, "Invalid request. Receiver ID cannot be undefined.");
  }
  if (!text || text.trim() === "") {
    throw new AppError(400, "Invalid request. Message text cannot be empty.");
  }
  const message = await MessageService.sendMessage(senderId, String(receiverId), text);

  res.status(201).json({ success: true, data: message });
});

export const getMessagesController = catchAsync(async (req: Request, res: Response) => {
  const userId1 = req?.user?.id || req?.user?._id || req?.user?.userId;
  const { receiverId: userId2 } = req.params;
  if (!userId1 || userId1 === "undefined") {
    throw new AppError(401, "Authentication failed. Current User ID is undefined.");
  }
  if (!userId2 || userId2 === "undefined") {
    throw new AppError(400, "Invalid request. Target User ID cannot be undefined.");
  }

  const messages = await MessageService.getMessages(userId1, String(userId2));

  res.status(200).json({ success: true, data: messages });
});

export const getConversationsController = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user?.id || req?.user?._id || req?.user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const conversations = await MessageService.getUserConversations(userId);

  res.status(200).json({ success: true, data: conversations });
});
