import { Document, Types } from "mongoose";

export type TPostTag = "EVENT" | "ANNOUNCEMENT" | "HOUSING" | "ACADEMICS" | "GENERAL";

export interface IPost {
  author: Types.ObjectId;
  content: string;
  images: string[];
  tags: TPostTag[];
  clubAssociation?: Types.ObjectId;
  likes: Types.ObjectId[];
  commentsCount: number;
  isArchived: boolean;
}

export interface IPostDocument extends IPost, Document {
  createdAt: Date;
  updatedAt: Date;
}
