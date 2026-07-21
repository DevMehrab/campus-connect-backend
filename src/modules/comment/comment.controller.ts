import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const authorId = req.user!.userId;
  const { content } = req.body;

  const result = await CommentService.createComment(String(postId), authorId, content);

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: result
  });
});

const getPostComments = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const currentUserId = req.user?.id || req.user?._id || req.user?.userId;

  const result = await CommentService.getPostComments(String(postId), req.query, currentUserId);

  res.status(200).json({
    success: true,
    message: "Comments retrieved successfully",
    meta: result.meta,
    data: result.data
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const currentUserId = req.user?.userId || req.user?.id || req.user?._id;

  await CommentService.deleteComment(String(commentId), currentUserId);

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
    data: null
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const currentUserId = req.user?.userId || req.user?.id || req.user?._id;
  const { content } = req.body;

  const result = await CommentService.updateComment(
    String(commentId),
    currentUserId,
    content
  );

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    data: result
  });
});

export const CommentController = {
  createComment,
  getPostComments,
  deleteComment,
  updateComment
};
