import { Conversation, Message } from "./message.model";
import { getIO, getReceiverSocketId } from "../../config/socket";
import { AppError } from "../../errors/AppError";

export const sendMessage = async (senderId: string, receiverId: string, text: string) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId]
    });
  }

  const newMessage = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    receiver: receiverId,
    text
  });

  conversation.lastMessage = newMessage._id as any;
  await conversation.save();

  const receiverSocketId = getReceiverSocketId(receiverId.toString());
  if (receiverSocketId) {
    const io = getIO();
    io.to(receiverSocketId).emit("receive-message", newMessage);
  }

  return newMessage;
};

export const getMessages = async (userId1: string, userId2: string) => {
  const conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2] }
  });

  if (!conversation) return [];

  const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

  return messages;
};

export const getUserConversations = async (userId: string) => {
  const conversations = await Conversation.find({
    participants: userId
  })
    .populate("participants", "name profilePicture username _id")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return conversations;
};
