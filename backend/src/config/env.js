import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/ai-mystery-room'),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET must be at least 24 characters').default('development-only-change-this-secret'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_IMAGE_MODEL: z.string().optional(),
  GEMINI_RETRY_LIMIT: z.coerce.number().int().min(0).max(5).default(2),
});
export const env = schema.parse(process.env);
