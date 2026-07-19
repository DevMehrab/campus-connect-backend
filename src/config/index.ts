import dotenv from "dotenv";
import { z } from "zod";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env")
});

const envVarsSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  MONGO_URI: z.string().url({
    message: "MONGO_URI must be a valid URL"
  }),
  GROQ_API_KEY: z.string({
    message: "GROQ_API_KEY is required in the .env file"
  })
});

const envVars = envVarsSchema.safeParse(process.env);

if (!envVars.success) {
  console.error("Invalid environment variables:", envVars.error.format());
  process.exit(1);
}

export const config = {
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  db: {
    uri: envVars.data.MONGO_URI
  },
  groqApiKey: envVars.data.GROQ_API_KEY
};
