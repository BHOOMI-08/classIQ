import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireAttemptOwner, requireActiveAttempt } from '../middleware/requireAttemptAccess.js';
import { startAttempt, getAttemptState, submitAttempt, getEligibility, trackEvent } from '../controllers/quizAttempt.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.get('/quizzes/:quizId/eligibility', authorize('student'), getEligibility);
router.post('/quizzes/:quizId/attempt/start', authorize('student'), startAttempt);
router.get('/attempts/:attemptId', requireAttemptOwner, getAttemptState);
router.post('/attempts/:attemptId/submit', requireAttemptOwner, submitAttempt);
router.post('/attempts/:attemptId/events', requireAttemptOwner, trackEvent);

export default router;
