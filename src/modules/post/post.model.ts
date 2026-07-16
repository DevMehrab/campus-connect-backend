import { Schema, model } from "mongoose";
import { IPostDocument } from "./post.interface";

const postSchema = new Schema<IPostDocument>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post must have an author"]
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [2000, "Post cannot exceed 2000 characters"],
      trim: true
    },
    images: {
      type: [String],
      validate: {
        validator: function (val: string[]) {
          return val.length <= 4;
        },
        message: "A post can have a maximum of 4 images"
      },
      default: []
    },
    tags: {
      type: [String],
      enum: ["EVENT", "ANNOUNCEMENT", "HOUSING", "ACADEMICS", "GENERAL"],
      default: ["GENERAL"]
    },
    clubAssociation: {
      type: Schema.Types.ObjectId,
      ref: "Club"
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    commentsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({
  isArchived: 1,
  createdAt: -1
});

postSchema.index({
  author: 1,
  createdAt: -1
});

export const Post = model<IPostDocument>("Post", postSchema);
