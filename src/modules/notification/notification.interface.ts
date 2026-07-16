import { Document, Types } from "mongoose";

export type TNotificationType = "LIKE" | "COMMENT" | "FOLLOW";

export interface INotification {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: TNotificationType;
  post?: Types.ObjectId;
  isRead: boolean;
}

export interface INotificationDocument extends INotification, Document {
  createdAt: Date;
  updatedAt: Date;
}
