import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserService } from "./user.service";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { AppError } from "../../errors/AppError";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user?.id || req.user?._id || req.user?.userId;

  const result = await UserService.getUserProfile(currentUserId, currentUserId);

  res.status(200).json({
    success: true,
    message: "Profile retrieved",
    data: result
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user!.userId;
  const targetUserId = req.params.id;

  const result = await UserService.getUserProfile(String(targetUserId), currentUserId);

  res.status(200).json({
    success: true,
    message: "Profile retrieved",
    data: result
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await UserService.updateProfile(userId, req.body);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});

const toggleFollow = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user!.userId;
  const targetUserId = req.params.id;

  const result = await UserService.toggleFollow(String(targetUserId), currentUserId);

  res.status(200).json({
    success: true,
    message: `Successfully ${result.status}`,
    data: result
  });
});

const updateAvatar = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user?.id || req.user?._id || req.user?.userId;

  if (!req.file) {
    throw new AppError(400, "Please upload a file");
  }

  const result = await uploadToCloudinary(req.file.buffer, "avatars");

  const updatedUser = await UserService.updateProfile(currentUserId, {
    profilePicture: result.secure_url
  });

  res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
    data: updatedUser
  });
});

export const getAllUsersController = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req?.user?.id || req?.user?._id || req?.user?.userId;
  if (!currentUserId) {
    throw new AppError(401, "Unauthorized");
  }

  const users = await UserService.getAllUsers(currentUserId);

  res.status(200).json({
    success: true,
    data: users
  });
});

export const UserController = {
  getMyProfile,
  getUserProfile,
  updateProfile,
  toggleFollow,
  updateAvatar,
  getAllUsersController
};
