import { Document, Types } from "mongoose";

export interface IComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
}

export interface ICommentDocument extends IComment, Document {
  createdAt: Date;
  updatedAt: Date;
}
