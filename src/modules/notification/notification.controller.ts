import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { NotificationService } from "./notification.service";
import { AppError } from "../../errors/AppError";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await NotificationService.getUserNotifications(userId, req.query);

  res.status(200).json({
    success: true,
    message: "Notifications retrieved",
    meta: result.meta,
    data: result.data
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await NotificationService.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data: null
  });
});

const markSingleAsRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id || req.user?._id || req.user?.userId;

  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const notification = await NotificationService.markSingleAsRead(String(id), userId);

  if (!notification) {
    throw new AppError(404, "Notification not found or already deleted");
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read successfully",
    data: notification
  });
});

export const NotificationController = {
  getMyNotifications,
  markAllAsRead,
  markSingleAsRead
};
