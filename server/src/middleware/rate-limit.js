import rateLimit from 'express-rate-limit';

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message,
        errors: [],
      });
    },
  });
};

export const loginRateLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts. Please try again after 15 minutes.'
);

export const registerRateLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'Too many registration requests from this IP. Please try again later.'
);

export const forgotPasswordLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Too many password reset requests. Please try again after 15 minutes.'
);

export const resetPasswordLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Too many password reset attempts. Please try again after 15 minutes.'
);

export const verificationResendLimiter = createLimiter(
  60 * 1000,
  2,
  'Please wait at least 60 seconds before requesting another verification email.'
);

export const refreshTokenLimiter = createLimiter(
  15 * 60 * 1000,
  30,
  'Too many refresh requests. Please try again later.'
);

export const avatarUploadLimiter = createLimiter(
  15 * 60 * 1000,
  15,
  'Too many avatar upload attempts. Please try again later.'
);

export const joinCodeLimiter = createLimiter(
  15 * 60 * 1000,
  15,
  'Too many join code attempts. Please try again after 15 minutes.'
);

export const attendanceSubmissionLimiter = createLimiter(
  5 * 60 * 1000,
  30,
  'Too many attendance submission attempts. Please slow down.'
);

export const attendanceStartLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many attendance session start requests.'
);

export const attendanceReportLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many report export requests. Please try again later.'
);

export const analyticsQueryLimiter = createLimiter(
  60 * 1000,
  60,
  'Too many analytics requests. Please wait a moment.'
);

// Backward compatibility alias
export const authRateLimiter = loginRateLimiter;
