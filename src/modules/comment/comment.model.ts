import { Schema, model } from "mongoose";
import { ICommentDocument } from "./comment.interface";

const commentSchema = new Schema<ICommentDocument>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Comment must belong to a post"]
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment must have an author"]
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

commentSchema.index({
  post: 1,
  createdAt: -1
});

export const Comment = model<ICommentDocument>("Comment", commentSchema);
