import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLOUD_PROJECT: z.string().min(1),
  DOCUMENT_BUCKET: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default("http://localhost:4173"),
  MAX_DOCUMENT_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024)
});

export type AppConfig = z.infer<typeof schema> & { allowedOrigins: string[] };

export function loadConfig(env = process.env): AppConfig {
  const parsed = schema.parse(env);
  return {
    ...parsed,
    allowedOrigins: parsed.ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean)
  };
}

