import { Router } from "express";
import { PostController } from "./post.controller";
import { validate } from "../../middlewares/validate.middleware";
import { PostValidation } from "./post.validation";
import { auth } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post(
  "/",
  auth("STUDENT", "ALUMNI"),
  upload.array("images", 4),
  validate(PostValidation.createPostSchema),
  PostController.createPost
);
router.get(
  "/feed",
  auth("STUDENT", "ALUMNI"),
  validate(PostValidation.getFeedSchema),
  PostController.getFeed
);

router.put("/:id/like", auth("STUDENT", "ALUMNI"), PostController.toggleLike);

router.get("/my-posts", auth("STUDENT", "ALUMNI"), PostController.getMyPosts);
router.get("/user/:userId", auth("STUDENT", "ALUMNI"), PostController.getSpecificUserPosts);

router.delete("/:postId", auth("STUDENT", "ALUMNI"), PostController.deletePost);
router.get("/:id", auth("STUDENT", "ALUMNI"), PostController.getPostById);
router.put(
  "/:id",
  auth("STUDENT", "ALUMNI"),
  validate(PostValidation.updatePostSchema),
  PostController.updatePost
);

export const PostRoutes = router;
