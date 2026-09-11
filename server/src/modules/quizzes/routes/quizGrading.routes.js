import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireQuizOwner } from '../middleware/requireQuizOwner.js';
import { getPendingReview, submitReview, finalizeResult } from '../controllers/quizGrading.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.get('/quizzes/:quizId/review', authorize('teacher', 'admin'), requireQuizOwner, getPendingReview);
router.post('/review/:questionScoreId', authorize('teacher', 'admin'), submitReview);
router.post('/results/:resultId/finalize', authorize('teacher', 'admin'), finalizeResult);

export default router;
