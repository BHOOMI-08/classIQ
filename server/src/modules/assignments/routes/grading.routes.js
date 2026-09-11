import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import * as gradingController from '../controllers/grading.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/submissions/:submissionId/grades',
  authorize('teacher', 'admin'),
  gradingController.gradeSubmission
);

router.post(
  '/submissions/:submissionId/return',
  authorize('teacher', 'admin'),
  gradingController.returnSubmission
);

export default router;
