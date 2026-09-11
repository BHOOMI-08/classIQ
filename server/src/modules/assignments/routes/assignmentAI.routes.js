import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireClassroomOwner } from '../../../middleware/classroomAccess.js';
import * as aiController from '../controllers/assignmentAI.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/classes/:classId/assignments/ai/generate',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  aiController.generateAIAssignment
);

export default router;
