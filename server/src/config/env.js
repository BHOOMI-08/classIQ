import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
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
    const weakSecrets = [
      'replace_with_secure_secret',
      'classiq_super_secret_access_key_2026_change_in_prod',
      'classiq_super_secret_refresh_key_2026_change_in_prod',
      'classiq_hmac_secret_key_2026_dev_mode_secret_key_min_32_bytes_long',
      'secret',
      'password',
    ];
    if (
      weakSecrets.some(
        (s) =>
          data.JWT_ACCESS_SECRET.includes(s) ||
          data.JWT_REFRESH_SECRET.includes(s) ||
          data.ATTENDANCE_HMAC_SECRET.includes(s)
      )
    ) {
      throw new Error('❌ Weak or default secrets are not allowed in production!');
    }
  }

  return data;
};

export const env = parseEnv();
