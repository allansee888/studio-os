import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

export const envSchema = z.object({
  // Core Application Configuration
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().positive().default(3000),
  CLIENT_URL: z.string().min(1).default("http://localhost:3000"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  // Database Configuration
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Authentication Configuration
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().min(1).default("1d"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1).default("7d"),

  // Optional External Services Configuration (Prepared for future use)
  STORAGE_PROVIDER: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  EMAIL_PROVIDER: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(): Config {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => ` - ${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("\n");
    console.error("❌ Environment configuration validation failed:\n" + formattedErrors);
    throw new Error(`Environment validation failed:\n${formattedErrors}`);
  }

  return result.data;
}

export const config: Config = loadConfig();
export default config;
