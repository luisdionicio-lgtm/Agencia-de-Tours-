import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(16).default("cambia_este_secreto_en_produccion"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
  CULQI_API_URL: z.string().url().default("https://api.culqi.com/v2"),
  CULQI_PRIVATE_KEY: z.string().default(""),
  CULQI_WEBHOOK_SECRET: z.string().default(""),
  ALLOW_DEMO_PAYMENTS: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  MAIL_FROM: z.string().default("no-reply@jhontours.com"),
  ADMIN_EMAIL: z.string().email().default("admin@jhontours.com"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin12345")
});

export const env = envSchema.parse(process.env);
