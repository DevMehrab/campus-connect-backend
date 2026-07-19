import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PostService } from "./post.service";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { AppError } from "../../errors/AppError";

const createPost = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user!.userId;

  let imageUrls: string[] = [];

  if (req.files && Array.isArray(req.files)) {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, "posts"));

    const uploadResults = await Promise.all(uploadPromises);
    imageUrls = uploadResults.map(result => result.secure_url);
  }

  const postPayload = {
    content: req.body.content,

    ...(imageUrls.length > 0 && { images: imageUrls })
  };

  const result = await PostService.createPost(authorId, postPayload);

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: result
  });
});

const getFeed = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user?.userId || req.user?._id;

  const result = await PostService.getFeed(req.query, currentUserId);

  res.status(200).json({
    success: true,
    message: "Feed retrieved successfully",
    meta: result.meta,
    data: result.data
  });
});

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const result = await PostService.toggleLike(String(id), userId);

  res.status(200).json({
    success: true,
    message: "Post like status updated",
    data: result
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const currentUserId = req.user?.id || req.user?._id || req.user?.userId;

  await PostService.deletePost(String(postId), currentUserId);

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
    data: null
  });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user?.id || req.user?._id || req.user?.userId;

  const result = await PostService.getUserPosts(currentUserId, currentUserId, req.query);

  res.status(200).json({
    success: true,
    data: result
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await PostService.getPostById(String(id));

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  res.status(200).json({
    success: true,
    message: "Post retrieved successfully",
    data: post
  });
});

const getSpecificUserPosts = catchAsync(async (req: Request, res: Response) => {
  const { userId: targetUserId } = req.params;
  const currentUserId = req.user?.id || req.user?._id || req.user?.userId;

  const result = await PostService.getUserPosts(String(targetUserId), currentUserId, req.query);

  res.status(200).json({
    success: true,
    message: "User posts retrieved successfully",
    data: result
  });
});

export const PostController = {
  createPost,
  getFeed,
  toggleLike,
  deletePost,
  getMyPosts,
  getPostById,
  getSpecificUserPosts
};
