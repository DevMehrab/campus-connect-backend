import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { askAssistant } from "./assistant.service";
import { AppError } from "../../errors/AppError";

export const handleChat = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;
  const userId = req?.user?.id || req.user?.userId;

  if (!message) {
    throw new AppError(400, "Message is required");
  }

  const responseText = await askAssistant(userId, message);

  res.status(200).json({
    success: true,
    message: "AI response generated successfully",
    data: {
      reply: responseText
    }
  });
});
