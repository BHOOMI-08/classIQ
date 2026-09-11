export const AUTH_CONSTANTS = {
  SALT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME_MS: 15 * 60 * 1000, // 15 minutes
  VERIFICATION_TOKEN_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  RESET_TOKEN_TTL_MS: 60 * 60 * 1000, // 1 hour
  REFRESH_TOKEN_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  COOKIE_NAMES: {
    REFRESH_TOKEN: 'refreshToken',
    DEVICE_ID: 'deviceId',
  },
  ACCOUNT_STATUS: {
    PENDING_VERIFICATION: 'pending_verification',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    DEACTIVATED: 'deactivated',
  },
};
