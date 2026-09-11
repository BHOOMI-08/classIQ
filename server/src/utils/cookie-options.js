import { env } from '../config/env.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

export const getRefreshTokenCookieOptions = () => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/api/v1/auth',
    maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_TTL_MS,
  };
};

export const getDeviceIdCookieOptions = () => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  };
};

export const getClearRefreshTokenCookieOptions = () => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/api/v1/auth',
  };
};
