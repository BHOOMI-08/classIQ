import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireClassroomOwner } from '../../../middleware/classroomAccess.js';
import { requireAssignmentOwner } from '../middleware/requireAssignmentOwner.js';
import { requireAssignmentAccess } from '../middleware/requireAssignmentAccess.js';
import * as assignmentController from '../controllers/assignment.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/classes/:classId/assignments', assignmentController.getClassroomAssignments);

router.post(
  '/classes/:classId/assignments',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  assignmentController.createAssignment
);

router.get('/assignments/:assignmentId', requireAssignmentAccess, assignmentController.getAssignmentDetails);

router.post(
  '/assignments/:assignmentId/publish',
  authorize('teacher', 'admin'),
  requireAssignmentOwner,
  assignmentController.publishAssignment
);

router.post(
  '/assignments/:assignmentId/duplicate',
  authorize('teacher', 'admin'),
  requireAssignmentOwner,
  assignmentController.duplicateAssignment
);

router.post(
  '/assignments/:assignmentId/archive',
  authorize('teacher', 'admin'),
  requireAssignmentOwner,
  assignmentController.archiveAssignment
);

export default router;
