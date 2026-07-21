import { AppError } from "../../errors/AppError";
import { Post } from "./post.model";
import { IPost } from "./post.interface";
import { NotificationService } from "../notification/notification.service";
import { Comment } from "../comment/comment.model";
import redisClient from "../../config/redis";

const invalidateFeedCache = async () => {
  const keys = await redisClient.keys("feed:*");
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
};

const createPost = async (authorId: string, payload: Partial<IPost>) => {
  const post = await Post.create({
    ...payload,
    author: authorId
  });
  await invalidateFeedCache();

  return await post.populate("author", "name profilePicture role universityId");
};

const getFeed = async (query: Record<string, any>, currentUserId: string) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const cacheKey = `feed:page:${page}:limit:${limit}:tag:${query.tag || "none"}`;

  let rawPosts;
  let total;

  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    rawPosts = parsed.posts;
    total = parsed.total;
  } else {
    const filter: Record<string, unknown> = { isArchived: false };
    if (query.tag) filter.tags = { $in: [query.tag] };

    rawPosts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name profilePicture role username universityId")
      .lean();

    total = await Post.countDocuments(filter);

    await redisClient.setex(cacheKey, 300, JSON.stringify({ posts: rawPosts, total }));
  }

  const formattedPosts = rawPosts.map((post: any) => {
    const hasLiked =
      Array.isArray(post.likes) && currentUserId
        ? post.likes.some((id: any) => id && id.toString() === currentUserId.toString())
        : false;

    const isAuthor =
      currentUserId && post.author
        ? post.author._id.toString() === currentUserId.toString()
        : false;

    return { ...post, hasLiked, isAuthor };
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: formattedPosts
  };
};

const toggleLike = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(404, "Post not found");
  }

  const hasLiked = post.likes.some(id => id.toString() === userId.toString());

  let updatedPost;
  if (hasLiked) {
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          likes: userId
        }
      },
      {
        new: true
      }
    );
  } else {
    updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: {
          likes: userId
        }
      },
      {
        new: true
      }
    );
    NotificationService.createNotification({
      recipient: post.author.toString(),
      sender: userId,
      type: "LIKE",
      post: postId
    }).catch(err => console.error("Failed to create notification", err));
  }
  await invalidateFeedCache();
  return updatedPost;
};

const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.author.toString() !== userId.toString()) {
    throw new AppError(403, "You are not authorized to delete this post");
  }

  await Post.findByIdAndDelete(postId);

  await Comment.deleteMany({ post: postId });
  await invalidateFeedCache();

  return { message: "Post deleted successfully" };
};

const getUserPosts = async (
  targetUserId: string,
  currentUserId: string,
  query: Record<string, any>
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({ author: targetUserId, isArchived: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name profilePicture role username universityId")
    .lean();

  const formattedPosts = posts.map(post => {
    const hasLiked =
      Array.isArray(post.likes) && currentUserId
        ? post.likes.some(id => id && id.toString() === currentUserId.toString())
        : false;

    const isAuthor =
      currentUserId && post.author
        ? post.author._id.toString() === currentUserId.toString()
        : false;

    return { ...post, hasLiked, isAuthor };
  });

  return formattedPosts;
};

const getPostById = async (postId: string) => {
  const post = await Post.findById(postId).populate("author", "name profilePicture username _id");
  if (!post) {
    throw new AppError(404, "Post not found");
  }

  return post;
};

const updatePost = async (postId: string, userId: string, payload: Partial<IPost>) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.author.toString() !== userId.toString()) {
    throw new AppError(403, "You are not authorized to update this post");
  }

  const allowedUpdates = ["content", "images", "tags", "isArchived"];
  const updates: Record<string, any> = {};

  for (const key of allowedUpdates) {
    if (payload[key as keyof IPost] !== undefined) {
      updates[key] = payload[key as keyof IPost];
    }
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("author", "name profilePicture role username universityId");

  await invalidateFeedCache();

  return updatedPost;
};

export const PostService = {
  createPost,
  getFeed,
  toggleLike,
  deletePost,
  getUserPosts,
  getPostById,
  updatePost
};
