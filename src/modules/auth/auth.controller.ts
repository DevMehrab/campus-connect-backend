import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { addWelcomeEmailJob } from "../../jobs/email.queue";

const cookieOptions = {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);
  const { refreshToken, accessToken, user } = result;

  res.cookie("refreshToken", refreshToken, cookieOptions);
  await addWelcomeEmailJob(req.body.email, req.body.username);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      accessToken
    }
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken, user } = result;

  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: {
      user,
      accessToken
    }
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new UnauthorizedError("No refresh token found. Please log in again.");
  }

  const result = await AuthService.refreshAccessToken(token);

  res.status(200).json({
    success: true,
    message: "Access token successfully refreshed",
    data: {
      accessToken: result.accessToken
    }
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict"
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
    data: null
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  logout
};
