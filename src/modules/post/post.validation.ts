import { z } from "zod";

const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required").max(2000, "Post is too long"),
    images: z
      .array(z.string().url("Invalid image URL"))
      .max(4, "You can only upload up to 4 images")
      .optional(),
    tags: z.array(z.enum(["EVENT", "ANNOUNCEMENT", "HOUSING", "ACADEMICS", "GENERAL"])).optional()
  })
});

const getFeedSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a positive number").transform(Number).optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a positive number")
      .transform(Number)
      .optional(),
    tag: z.enum(["EVENT", "ANNOUNCEMENT", "HOUSING", "ACADEMICS", "GENERAL"]).optional()
  })
});

const updatePostSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required").max(2000, "Post is too long").optional(),
    images: z
      .array(z.string().url("Invalid image URL"))
      .max(4, "You can only upload up to 4 images")
      .optional(),
    tags: z.array(z.enum(["EVENT", "ANNOUNCEMENT", "HOUSING", "ACADEMICS", "GENERAL"])).optional(),
    isArchived: z.boolean().optional()
  })
});

export const PostValidation = {
  createPostSchema,
  getFeedSchema,
  updatePostSchema
};
