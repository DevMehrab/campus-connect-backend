import { Schema, model, Document } from "mongoose";

export interface IConversation extends Document {
  participants: Schema.Types.ObjectId[];
  lastMessage?: Schema.Types.ObjectId;
}

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" }
  },
  { timestamps: true }
);

export const Conversation = model("Conversation", conversationSchema);

export interface IMessage extends Document {
  conversationId: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  text: string;
  isRead: boolean;
}

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Message = model("Message", messageSchema);
