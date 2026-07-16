import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    username: z
      .string({
        message: "Username is required"
      })
      .min(6, "Username must be at least 6 characters"),
    email: z
      .string({
        message: "Email is required"
      })
      .email("Invalid email address"),
    password: z
      .string({
        message: "Password is required"
      })
      .min(8, "Password must be at least 8 characters"),
    role: z.enum(["STUDENT", "ALUMNI"]).default("STUDENT")
  })
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: "Email is required"
      })
      .email("Invalid email format"),
    password: z.string({
      message: "Password is required"
    })
  })
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema
};
