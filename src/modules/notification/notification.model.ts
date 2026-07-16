import { Schema, model } from "mongoose";
import { INotificationDocument } from "./notification.interface";

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "FOLLOW"],
      required: true
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post"
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({
  recipient: 1,
  createdAt: -1
});

notificationSchema.index({
  recipient: 1,
  isRead: 1
});

export const Notification = model<INotificationDocument>("Notification", notificationSchema);
