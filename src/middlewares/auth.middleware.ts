import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { AppError } from "../errors/AppError";
import { verifyToken } from "../utils/jwt";
import { User } from "../modules/user/user.model";
import { TUserRole } from "../modules/user/user.interface";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        userId: string;
        role: TUserRole;
      };
    }
  }
}

export const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("You are not logged in. Please provide a valid token.");
    }

    const token = authHeader.split(" ")[1];
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      throw new Error("JWT_ACCESS_SECRET is missing from environment");
    }
    let decoded: any;
    try {
      decoded = verifyToken(token, accessSecret);
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired token.");
    }

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      throw new UnauthorizedError("The user belonging to this token no longer exists.");
    }

    if (!currentUser.isActive) {
      throw new UnauthorizedError("Your account has been deactivated.");
    }

    if (requiredRoles.length && !requiredRoles.includes(currentUser.role)) {
      throw new AppError(403, "You do not have permission to perform this action.");
    }

    req.user = decoded as JwtPayload & {
      userId: string;
      role: TUserRole;
    };

    next();
  });
};
