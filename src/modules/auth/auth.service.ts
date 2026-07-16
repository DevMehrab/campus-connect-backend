import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "../../utils/jwt";
import { User } from "../user/user.model";
import { IUser } from "../user/user.interface";
import { AppError } from "../../errors/AppError";
import { UnauthorizedError } from "../../errors/UnauthorizedError";

const createTokens = (userId: string, role: string) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets are missing from environment variables");
  }

  const accessToken = generateToken(
    {
      userId,
      role
    },
    accessSecret,
    "15m"
  );
  const refreshToken = generateToken(
    {
      userId,
      role
    },
    refreshSecret,
    "7d"
  );

  return {
    accessToken,
    refreshToken
  };
};

const registerUser = async (payload: IUser) => {
  const existingUser = await User.findOne({
    $or: [{ email: payload.email }, { username: payload.username }]
  });

  if (existingUser) {
    if (existingUser.email === payload.email) {
      throw new AppError(409, "A user with this email already exists.");
    }
    if (existingUser.username === payload.username) {
      throw new AppError(409, "This username is already taken.");
    }
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(payload.password, salt);

  const newUser = await User.create({
    ...payload,
    password: hashedPassword
  });

  const { accessToken, refreshToken } = createTokens(newUser._id.toString(), newUser.role);

  return {
    user: newUser,
    accessToken,
    refreshToken
  };
};

const loginUser = async (payload: Pick<IUser, "email" | "password">) => {
  const user = await User.findOne({
    email: payload.email
  }).select("+password");

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("This account has been disabled. Please contact support.");
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const { accessToken, refreshToken } = createTokens(user._id.toString(), user.role);

  return {
    user,
    accessToken,
    refreshToken
  };
};

const refreshAccessToken = async (token: string) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is missing");
  }

  let decoded;
  try {
    decoded = verifyToken(token, refreshSecret);
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token. Please log in again.");
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new UnauthorizedError("The user belonging to this token no longer exists.");
  }
  if (!user.isActive) {
    throw new UnauthorizedError("This account has been disabled.");
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const newAccessToken = generateToken(
    {
      userId: user._id,
      role: user.role
    },
    accessSecret as string,
    "15m"
  );

  return {
    accessToken: newAccessToken
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshAccessToken
};
