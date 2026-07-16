import { z } from "zod";

const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string({
        message: "Content is required"
      })
      .min(1, "Comment cannot be empty")
      .max(500, "Comment is too long")
  })
});

export const CommentValidation = {
  createCommentSchema
};
