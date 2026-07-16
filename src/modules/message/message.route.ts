import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import {
  sendMessageController,
  getMessagesController,
  getConversationsController
} from "./message.controller";

const router = Router();

router.get("/conversations", auth("STUDENT", "ALUMNI"), getConversationsController);

router.post("/send/:receiverId", auth("STUDENT", "ALUMNI"), sendMessageController);
router.get("/:receiverId", auth("STUDENT", "ALUMNI"), getMessagesController);

export const MessageRoutes = router;
