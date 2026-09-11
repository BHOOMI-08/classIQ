import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createPollSchema, respondPollSchema } from '../validation/engagement.validation.js';
import {
  createPoll,
  getClassroomPolls,
  getPollById,
  startPoll,
  respondPoll,
  closePoll,
  revealPollAnswer,
} from '../controllers/poll.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/classes/:classId/polls', authorize('teacher', 'admin'), validate(createPollSchema), createPoll);
router.get('/classes/:classId/polls', getClassroomPolls);
router.get('/polls/:pollId', getPollById);
router.post('/polls/:pollId/start', authorize('teacher', 'admin'), startPoll);
router.post('/student/polls/:pollId/respond', authorize('student'), validate(respondPollSchema), respondPoll);
router.post('/polls/:pollId/close', authorize('teacher', 'admin'), closePoll);
router.post('/polls/:pollId/reveal-answer', authorize('teacher', 'admin'), revealPollAnswer);

export default router;
