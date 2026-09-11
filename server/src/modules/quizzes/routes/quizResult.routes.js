import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireQuizOwner } from '../middleware/requireQuizOwner.js';
import { requireAttemptOwner } from '../middleware/requireAttemptAccess.js';
import { getStudentResult, getTeacherAttemptResult, releaseResults, getQuizResultsList, getExplanation } from '../controllers/quizResult.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

// Student
router.get('/attempts/:attemptId/result', requireAttemptOwner, getStudentResult);
router.get('/results/:scoreId/explanation', authenticate, getExplanation);

// Teacher
router.get('/quizzes/:quizId/results', authorize('teacher', 'admin'), requireQuizOwner, getQuizResultsList);
router.post('/quizzes/:quizId/results/release', authorize('teacher', 'admin'), requireQuizOwner, releaseResults);
router.get('/teacher/attempts/:attemptId/result', authorize('teacher', 'admin'), getTeacherAttemptResult);

export default router;
