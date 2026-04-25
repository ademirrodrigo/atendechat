import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  REDIS_URL: z.string().url(),
  EVOLUTION_API_URL: z.string().url(),
  EVOLUTION_API_KEY: z.string().min(1),
  EVOLUTION_INSTANCE: z.string().min(1),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  OLLAMA_URL: z.string().url().default("http://ollama:11434")
});

export const env = envSchema.parse(process.env);
