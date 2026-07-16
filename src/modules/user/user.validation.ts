import { z } from "zod";

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").optional(),
    bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
    profilePicture: z.string().url("Invalid image URL").optional(),
    universityId: z.string().optional()
  })
});

export const UserValidation = {
  updateProfileSchema
};
