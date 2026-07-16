import { Router } from "express";
import { UserController } from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { UserValidation } from "./user.validation";
import { auth } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.use(auth("STUDENT", "ALUMNI"));

router.get("/", UserController.getAllUsersController);
router.get("/me", UserController.getMyProfile);
router.get("/:id", UserController.getUserProfile);

router.patch(
  "/me",
  validate(UserValidation.updateProfileSchema),
  upload.single("profilePicture"),
  UserController.updateProfile
);
router.patch(
  "/me/avatar",
  auth("STUDENT", "ALUMNI"),
  upload.single("avatar"),
  UserController.updateAvatar
);

router.put("/:id/follow", UserController.toggleFollow);

export const UserRoutes = router;
