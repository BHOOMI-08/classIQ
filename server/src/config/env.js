import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  UPLOAD_DIR: z.string().default('uploads'),
  ATTENDANCE_HMAC_SECRET: z.string().default('classiq_hmac_secret_key_2026_dev_mode_secret_key_min_32_bytes_long'),
  GEMINI_API_KEY: z.string().optional().default(''),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:', result.error.format());
    throw new Error('Invalid environment configuration');
  }

  const data = result.data;

  if (data.NODE_ENV === 'production') {
    if (!data.JWT_ACCESS_SECRET || data.JWT_ACCESS_SECRET.length < 32) {
      throw new Error('❌ JWT_ACCESS_SECRET must be at least 32 characters long in production!');
    }
    if (!data.JWT_REFRESH_SECRET || data.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('❌ JWT_REFRESH_SECRET must be at least 32 characters long in production!');
    }
    if (data.JWT_ACCESS_SECRET === data.JWT_REFRESH_SECRET) {
      throw new Error('❌ JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must not be identical in production!');
    }
  }

  return data;
};

export const env = parseEnv();
