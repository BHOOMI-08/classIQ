import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import {
  loginRateLimiter,
  registerRateLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  verificationResendLimiter,
  refreshTokenLimiter,
} from '../../middleware/rate-limit.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  registerStudentSchema,
  registerTeacherSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from './auth.validation.js';

const router = Router();

// Registration
router.post(
  '/register/student',
  registerRateLimiter,
  validate(registerStudentSchema),
  asyncHandler(AuthController.registerStudent)
);

router.post(
  '/register/teacher',
  registerRateLimiter,
  validate(registerTeacherSchema),
  asyncHandler(AuthController.registerTeacher)
);

// Login & Session
router.post('/login', loginRateLimiter, validate(loginSchema), asyncHandler(AuthController.login));
router.post('/refresh', refreshTokenLimiter, asyncHandler(AuthController.refreshToken));
router.post('/logout', authenticate, asyncHandler(AuthController.logout));
router.post('/logout-all', authenticate, asyncHandler(AuthController.logoutAll));
router.get('/me', authenticate, asyncHandler(AuthController.getMe));

// Email verification
router.post(
  '/email/send-verification',
  authenticate,
  verificationResendLimiter,
  asyncHandler(AuthController.sendVerificationEmail)
);
router.post('/email/verify', validate(verifyEmailSchema), asyncHandler(AuthController.verifyEmail));

// Password Management
router.post(
  '/password/forgot',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(AuthController.forgotPassword)
);
router.post(
  '/password/reset',
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  asyncHandler(AuthController.resetPassword)
);
router.put(
  '/password/change',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(AuthController.changePassword)
);

export default router;
