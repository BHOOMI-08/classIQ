import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { joinCodeLimiter } from '../../middleware/rate-limit.js';
import { joinClassroomSchema } from './enrollment.validation.js';

import {
  joinClassroom,
  getStudentClassrooms,
  leaveClassroom,
} from './enrollment.controller.js';

const router = express.Router();

router.post(
  '/join',
  authenticate,
  authorize('student'),
  joinCodeLimiter,
  validate(joinClassroomSchema),
  joinClassroom
);

router.get(
  '/me',
  authenticate,
  authorize('student'),
  getStudentClassrooms
);

router.post(
  '/:classId/leave',
  authenticate,
  authorize('student'),
  leaveClassroom
);

export default router;
