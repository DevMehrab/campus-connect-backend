import { Comment } from "./comment.model";
import { Post } from "../post/post.model";
import { AppError } from "../../errors/AppError";
import { NotificationService } from "../notification/notification.service";

const createComment = async (postId: string, authorId: string, content: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(404, "Post not found");
  }

  const comment = await Comment.create({
    post: postId,
    author: authorId,
    content
  });

  await Post.findByIdAndUpdate(postId, {
    $inc: {
      commentsCount: 1
    }
  });
  NotificationService.createNotification({
    recipient: post.author.toString(),
    sender: authorId,
    type: "COMMENT",
    post: postId
  }).catch(err => console.error("Failed to create notification", err));
  return await comment.populate("author", "name profilePicture role username");
};

const getPostComments = async (
  postId: string,
  query: Record<string, any>,
  currentUserId: string
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name profilePicture role username")
    .lean();

  const total = await Comment.countDocuments({ post: postId });

  const formattedComments = comments.map(comment => {
    const isAuthor =
      currentUserId && comment.author
        ? comment.author._id.toString() === currentUserId.toString()
        : false;

    return { ...comment, isAuthor };
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: formattedComments
  };
};

const deleteComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(404, "Comment not found");
  }

  if (comment.author.toString() !== userId.toString()) {
    throw new AppError(403, "You are not authorized to delete this comment");
  }

  const postId = comment.post;

  await Comment.findByIdAndDelete(commentId);

  await Post.findByIdAndUpdate(postId, {
    $inc: { commentsCount: -1 }
  });

  return null;
};

const updateComment = async (
  commentId: string,
  userId: string,
  content: string
) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(404, "Comment not found");
  }

  if (comment.author.toString() !== userId.toString()) {
    throw new AppError(403, "You are not authorized to update this comment");
  }

  comment.content = content;
  await comment.save();

  return await comment.populate("author", "name profilePicture role username");
};

export const CommentService = {
  createComment,
  getPostComments,
  deleteComment,
  updateComment
};
