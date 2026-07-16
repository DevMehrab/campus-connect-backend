import { Document } from "mongoose";

export type TUserRole = "STUDENT" | "ALUMNI" | "ADMIN" | "SUPER_ADMIN";

export interface IUser {
  name: string;
  username: string;
  email: string;
  password: string;
  role: TUserRole;
  profilePicture?: string;
  universityId?: string;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  followers: string[];
  following: string[];
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}
