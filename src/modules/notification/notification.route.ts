import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { auth } from "../../middlewares/auth.middleware";

const router = Router();

router.use(auth("STUDENT", "ALUMNI"));

router.get("/", NotificationController.getMyNotifications);
router.patch("/read-all", NotificationController.markAllAsRead);
router.patch("/:id/read", NotificationController.markSingleAsRead);

export const NotificationRoutes = router;
