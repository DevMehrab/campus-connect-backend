import { Notification } from "./notification.model";
import { TNotificationType } from "./notification.interface";

const createNotification = async (payload: {
  recipient: string;
  sender: string;
  type: TNotificationType;
  post?: string;
}) => {
  if (payload.recipient.toString() === payload.sender.toString()) {
    return null;
  }

  return await Notification.create(payload);
};

const getUserNotifications = async (userId: string, query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({
    recipient: userId
  })
    .sort({
      createdAt: -1
    })
    .skip(skip)
    .limit(limit)
    .populate("sender", "username profilePicture")
    .populate("post", "content");

  const total = await Notification.countDocuments({
    recipient: userId
  });
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount
    },
    data: notifications
  };
};

const markAllAsRead = async (userId: string) => {
  await Notification.updateMany(
    {
      recipient: userId,
      isRead: false
    },
    {
      $set: {
        isRead: true
      }
    }
  );
  return null;
};

const markSingleAsRead = async (notificationId: string, userId: string) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId
    },
    {
      $set: { isRead: true }
    },
    { new: true }
  );

  return notification;
};

export const NotificationService = {
  createNotification,
  getUserNotifications,
  markAllAsRead,
  markSingleAsRead
};
