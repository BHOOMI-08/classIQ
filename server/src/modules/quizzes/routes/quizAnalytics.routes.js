import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireQuizOwner } from '../middleware/requireQuizOwner.js';
import { getQuizAnalytics, getQuestionAnalytics } from '../controllers/quizAnalytics.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.get('/quizzes/:quizId/analytics', authorize('teacher', 'admin'), requireQuizOwner, getQuizAnalytics);
router.get('/quizzes/:quizId/analytics/questions', authorize('teacher', 'admin'), requireQuizOwner, getQuestionAnalytics);

export default router;
