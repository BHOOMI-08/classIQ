import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { submitDoubtSchema, resolveDoubtSchema } from '../validation/engagement.validation.js';
import {
  submitDoubt,
  getClassroomDoubts,
  getStudentMyDoubts,
  upvoteDoubt,
  removeDoubtUpvote,
  resolveDoubt,
  rebuildDoubtClusters,
} from '../controllers/doubt.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/student/classes/:classId/doubts', authorize('student'), validate(submitDoubtSchema), submitDoubt);
router.get('/student/classes/:classId/doubts/me', authorize('student'), getStudentMyDoubts);
router.get('/classes/:classId/doubts', getClassroomDoubts);
router.post('/doubts/:doubtId/upvote', authorize('student'), upvoteDoubt);
router.delete('/doubts/:doubtId/upvote', authorize('student'), removeDoubtUpvote);
router.post('/doubts/:doubtId/resolve', authorize('teacher', 'admin'), validate(resolveDoubtSchema), resolveDoubt);
router.post('/classes/:classId/doubt-clusters/rebuild', authorize('teacher', 'admin'), rebuildDoubtClusters);

export default router;
