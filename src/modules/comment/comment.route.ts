import { Router } from "express";
import { CommentController } from "./comment.controller";
import { validate } from "../../middlewares/validate.middleware";
import { CommentValidation } from "./comment.validation";
import { auth } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/:postId",
  auth("STUDENT", "ALUMNI"),
  validate(CommentValidation.createCommentSchema),
  CommentController.createComment
);

router.get("/:postId", auth("STUDENT", "ALUMNI"), CommentController.getPostComments);

router.patch(
  "/:commentId",
  auth("STUDENT", "ALUMNI"),
  validate(CommentValidation.updateCommentSchema),
  CommentController.updateComment
);

router.delete("/:commentId", auth("STUDENT", "ALUMNI"), CommentController.deleteComment);

export const CommentRoutes = router;
