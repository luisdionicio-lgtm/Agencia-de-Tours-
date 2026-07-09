import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(16).default("cambia_este_secreto_en_produccion"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  CULQI_PRIVATE_KEY: z.string().default(""),
  ADMIN_EMAIL: z.string().email().default("admin@jhontours.com"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin12345")
});

export const env = envSchema.parse(process.env);

