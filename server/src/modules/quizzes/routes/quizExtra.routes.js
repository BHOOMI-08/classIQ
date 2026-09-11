import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireQuizOwner } from '../middleware/requireQuizOwner.js';
import { exportResultsCSV } from '../controllers/quizExport.controller.js';
import { createGrant, getGrants, revokeGrant } from '../controllers/quizAccessGrant.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

// Export
router.get('/quizzes/:quizId/export/results.csv', authorize('teacher', 'admin'), requireQuizOwner, exportResultsCSV);

// Access grants
router.get('/quizzes/:quizId/grants', authorize('teacher', 'admin'), requireQuizOwner, getGrants);
router.post('/quizzes/:quizId/grants', authorize('teacher', 'admin'), requireQuizOwner, createGrant);
router.delete('/quizzes/:quizId/grants/:grantId', authorize('teacher', 'admin'), requireQuizOwner, revokeGrant);

export default router;
