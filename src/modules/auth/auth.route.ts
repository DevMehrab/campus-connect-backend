import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { AuthValidation } from "./auth.validation";
import { authLimiter } from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(AuthValidation.registerValidationSchema),
  AuthController.register
);

router.post(
  "/login",
  authLimiter,
  validate(AuthValidation.loginValidationSchema),
  AuthController.login
);

router.post("/logout", AuthController.logout);

router.post("/refresh-token", authLimiter, AuthController.refreshToken);

export const AuthRoutes = router;
