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
  YAPE_RESERVATION_AMOUNT: z.coerce.number().positive().default(200),
  ENABLE_DEMO_STAFF: z.coerce.boolean().default(false),
  WORKER_EMAIL: z.string().email().optional(),
  WORKER_PASSWORD: z.string().min(12).optional(),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  MAIL_FROM: z.string().default("no-reply@johntours.com"),
  ADMIN_EMAIL: z.string().email().default("admin@johntours.com"),
  ADMIN_PASSWORD: z.string().min(8).default("Admin12345")
});

export const env = envSchema.parse(process.env);

export function getIntegrationStatus() {
  return {
    environment: env.NODE_ENV,
    database: {
      configured: Boolean(env.DATABASE_URL)
    },
    yape: {
      reservationAmount: env.YAPE_RESERVATION_AMOUNT,
      validationMode: "manual"
    },
    smtp: {
      configured: Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.MAIL_FROM),
      hostConfigured: Boolean(env.SMTP_HOST),
      portConfigured: Boolean(env.SMTP_PORT),
      userConfigured: Boolean(env.SMTP_USER),
      fromConfigured: Boolean(env.MAIL_FROM)
    }
  };
}

export function validateProductionConfig() {
  if (env.NODE_ENV !== "production") return;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (env.ENABLE_DEMO_STAFF) {
    errors.push("ENABLE_DEMO_STAFF no puede estar activo en produccion.");
  }
  if (env.ENABLE_DEMO_STAFF && (!env.WORKER_EMAIL || !env.WORKER_PASSWORD)) {
    errors.push("WORKER_EMAIL y WORKER_PASSWORD son obligatorios al habilitar personal demo.");
  }

  if (env.JWT_SECRET === "cambia_este_secreto_en_produccion" || env.JWT_SECRET === "change_this_secret") {
    errors.push("JWT_SECRET debe ser un secreto real en produccion.");
  }
  if (env.ADMIN_PASSWORD === "Admin12345" || env.ADMIN_PASSWORD.length < 16) {
    errors.push("ADMIN_PASSWORD debe tener al menos 16 caracteres y no puede usar la clave demostrativa.");
  }
  if (env.ADMIN_EMAIL === "admin@johntours.com") {
    errors.push("ADMIN_EMAIL debe ser una cuenta administrativa corporativa real.");
  }

  if (!getIntegrationStatus().smtp.configured) {
    warnings.push("SMTP no esta configurado. Los correos de confirmacion se omitiran hasta definir SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y MAIL_FROM.");
  }

  warnings.forEach((warning) => console.warn(`[config] ${warning}`));

  if (errors.length) {
    throw new Error(`Configuracion de produccion invalida: ${errors.join(" ")}`);
  }
}
