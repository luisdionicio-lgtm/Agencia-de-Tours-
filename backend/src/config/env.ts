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

const isPlaceholder = (value: string, markers: string[]) => !value || markers.some((marker) => value.includes(marker));

export function getIntegrationStatus() {
  return {
    environment: env.NODE_ENV,
    database: {
      configured: Boolean(env.DATABASE_URL)
    },
    culqi: {
      apiUrl: env.CULQI_API_URL,
      privateKeyConfigured: !isPlaceholder(env.CULQI_PRIVATE_KEY, ["xxxxxxxx", "change_this"]),
      webhookSecretConfigured: !isPlaceholder(env.CULQI_WEBHOOK_SECRET, ["change_this", "xxxxxxxx"]),
      demoPaymentsEnabled: env.NODE_ENV === "development" && env.ALLOW_DEMO_PAYMENTS,
      demoPaymentsAllowedInProduction: false
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

  if (env.ALLOW_DEMO_PAYMENTS) {
    errors.push("ALLOW_DEMO_PAYMENTS no puede estar activo en produccion.");
  }

  if (env.JWT_SECRET === "cambia_este_secreto_en_produccion" || env.JWT_SECRET === "change_this_secret") {
    errors.push("JWT_SECRET debe ser un secreto real en produccion.");
  }

  if (isPlaceholder(env.CULQI_PRIVATE_KEY, ["xxxxxxxx", "change_this"])) {
    warnings.push("CULQI_PRIVATE_KEY no esta configurado. Los pagos reales fallaran hasta definir la llave privada.");
  }

  if (!getIntegrationStatus().smtp.configured) {
    warnings.push("SMTP no esta configurado. Los correos de confirmacion se omitiran hasta definir SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y MAIL_FROM.");
  }

  warnings.forEach((warning) => console.warn(`[config] ${warning}`));

  if (errors.length) {
    throw new Error(`Configuracion de produccion invalida: ${errors.join(" ")}`);
  }
}
