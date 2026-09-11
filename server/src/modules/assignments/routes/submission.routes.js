import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireAssignmentAccess } from '../middleware/requireAssignmentAccess.js';
import { requireAssignmentOwner } from '../middleware/requireAssignmentOwner.js';
import { uploadSubmissionFiles } from '../middleware/validateSubmissionFile.js';
import * as submissionController from '../controllers/submission.controller.js';

const router = Router();

router.use(authenticate);

// Student submission endpoints
router.post(
  '/student/assignments/:assignmentId/submission/draft',
  requireAssignmentAccess,
  uploadSubmissionFiles.array('files', 5),
  submissionController.saveDraftSubmission
);

router.post(
  '/student/assignments/:assignmentId/submission/submit',
  requireAssignmentAccess,
  uploadSubmissionFiles.array('files', 5),
  submissionController.submitFinalAssignment
);

router.get('/student/assignments/:assignmentId/submission', requireAssignmentAccess, submissionController.getStudentSubmission);

// Teacher submission management endpoints
router.get(
  '/assignments/:assignmentId/submissions',
  authorize('teacher', 'admin'),
  requireAssignmentOwner,
  submissionController.getAssignmentSubmissions
);

router.get(
  '/submissions/:submissionId',
  authorize('teacher', 'admin'),
  submissionController.getSubmissionDetails
);

export default router;
