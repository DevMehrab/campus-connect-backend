import { Router } from "express";
import { handleChat } from "./assistant.controller";
import { auth } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/chat", auth("STUDENT", "ADMIN", "ALUMNI"), handleChat);

export const AssistantRoutes = router;
