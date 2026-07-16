import { User } from "./user.model";
import { AppError } from "../../errors/AppError";
import { NotificationService } from "../notification/notification.service";
import redisClient from "../../config/redis";

const invalidateFeedCache = async () => {
  const keys = await redisClient.keys("feed:*");
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
};

const getUserProfile = async (targetUserId: string, currentUserId: string) => {
  const user = await User.findById(targetUserId)
    .populate("followers", "name profilePicture")
    .populate("following", "name profilePicture");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isFollowing = user.followers.some(
    (follower: any) => follower._id.toString() === currentUserId
  );

  return {
    ...user.toObject(),
    isFollowing
  };
};

const updateProfile = async (userId: string, payload: Record<string, any>) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: payload
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedUser) {
    throw new AppError(404, "User not found");
  }
  await invalidateFeedCache();
  return updatedUser;
};

const toggleFollow = async (targetUserId: string, currentUserId: string) => {
  if (targetUserId === currentUserId) {
    throw new AppError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError(404, "User to follow not found");
  }

  const isFollowing = targetUser.followers.some(id => id.toString() === currentUserId.toString());

  if (isFollowing) {
    await Promise.all([
      User.findByIdAndUpdate(targetUserId, {
        $pull: {
          followers: currentUserId
        }
      }),
      User.findByIdAndUpdate(currentUserId, {
        $pull: {
          following: targetUserId
        }
      })
    ]);
    return {
      status: "unfollowed"
    };
  } else {
    await Promise.all([
      User.findByIdAndUpdate(targetUserId, {
        $addToSet: {
          followers: currentUserId
        }
      }),
      User.findByIdAndUpdate(currentUserId, {
        $addToSet: {
          following: targetUserId
        }
      })
    ]);
    NotificationService.createNotification({
      recipient: targetUserId,
      sender: currentUserId,
      type: "FOLLOW"
    }).catch(err => console.error("Failed to create notification", err));
    return {
      status: "followed"
    };
  }
};

const getAllUsers = async (currentUserId: string) => {
  const users = await User.find({ _id: { $ne: currentUserId } })
    .select("name profilePicture username")
    .sort({ name: 1 });

  return users;
};

export const UserService = {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getAllUsers
};
