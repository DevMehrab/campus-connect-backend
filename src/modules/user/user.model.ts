import { Schema, model } from "mongoose";
import { IUserDocument } from "./user.interface";

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, "Name must be at least 3 characters"]
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [6, "Username must be at least 6 characters"],
      maxlength: [16, "Username cannot exceed 16 characters"],
      match: [
        /^[a-z0-9.-]+$/,
        "Username can only contain letters, numbers, dots, and dashes without spaces"
      ]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ["STUDENT", "ALUMNI"],
        message: "{VALUE} is not a valid role"
      },
      default: "STUDENT"
    },
    profilePicture: {
      type: String,
      default: ""
    },
    universityId: {
      type: String,
      trim: true
    },
    batch: {
      type: Number,
      enum: {
        values: [1, 2, 3, 4],
        message: "{VALUE} is not a valid batch"
      },
      trim: true
    },
    bio: {
      type: String,
      maxlength: [160, "Bio cannot exceed 160 characters"]
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

export const User = model<IUserDocument>("User", userSchema);
