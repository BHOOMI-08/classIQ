import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireAttemptOwner } from '../middleware/requireAttemptAccess.js';
import { saveAnswer, getAnswers } from '../controllers/quizAnswer.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.get('/attempts/:attemptId/answers', requireAttemptOwner, getAnswers);
router.put('/attempts/:attemptId/answers/:attemptQuestionId', authorize('student'), requireAttemptOwner, saveAnswer);

export default router;
