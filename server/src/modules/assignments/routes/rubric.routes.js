import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireAssignmentOwner } from '../middleware/requireAssignmentOwner.js';
import { requireAssignmentAccess } from '../middleware/requireAssignmentAccess.js';
import * as rubricController from '../controllers/rubric.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/assignments/:assignmentId/rubric',
  authorize('teacher', 'admin'),
  requireAssignmentOwner,
  rubricController.createRubric
);

router.get('/assignments/:assignmentId/rubric', requireAssignmentAccess, rubricController.getAssignmentRubric);

export default router;
