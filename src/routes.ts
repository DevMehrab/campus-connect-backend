import { Router } from "express";
import { AuthRoutes } from "./modules/auth/auth.route";
import { UserRoutes } from "./modules/user/user.route";
import { PostRoutes } from "./modules/post/post.route";
import { CommentRoutes } from "./modules/comment/comment.route";
import { NotificationRoutes } from "./modules/notification/notification.route";
import { MessageRoutes } from "./modules/message/message.route";
import { AssistantRoutes } from "./modules/assistant/assistant.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/posts",
    route: PostRoutes
  },
  {
    path: "/comments",
    route: CommentRoutes
  },
  {
    path: "/users",
    route: UserRoutes
  },
  {
    path: "/notifications",
    route: NotificationRoutes
  },
  {
    path: "/messages",
    route: MessageRoutes
  },
  {
    path: "/assistant",
    route: AssistantRoutes
  }
];

moduleRoutes.forEach(route => {
  router.use(route.path, route.route);
});

export default router;
