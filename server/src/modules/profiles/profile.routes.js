import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { uploadAvatar } from '../../middleware/upload.js';
import { avatarUploadLimiter } from '../../middleware/rate-limit.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { ProfileController } from './profile.controller.js';
import {
  updateStudentProfileSchema,
  updateTeacherProfileSchema,
  deactivateAccountSchema,
} from './profile.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(ProfileController.getProfile));

router.patch('/', (req, res, next) => {
  const schema = req.user.role === 'student' ? updateStudentProfileSchema : updateTeacherProfileSchema;
  return validate(schema)(req, res, next);
}, asyncHandler(ProfileController.updateProfile));

router.post('/avatar', avatarUploadLimiter, uploadAvatar.single('avatar'), asyncHandler(ProfileController.uploadAvatar));
router.delete('/avatar', asyncHandler(ProfileController.deleteAvatar));

router.post('/deactivate', validate(deactivateAccountSchema), asyncHandler(ProfileController.deactivateAccount));

export default router;
