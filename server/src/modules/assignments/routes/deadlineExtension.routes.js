import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireAssignmentOwner } from '../middleware/requireAssignmentOwner.js';
import { requireAssignmentAccess } from '../middleware/requireAssignmentAccess.js';
import * as extensionController from '../controllers/deadlineExtension.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/assignments/:assignmentId/extensions',
  authorize('teacher', 'admin'),
  requireAssignmentOwner,
  extensionController.grantExtension
);

router.get(
  '/assignments/:assignmentId/extensions',
  requireAssignmentAccess,
  extensionController.getExtensions
);

export default router;
