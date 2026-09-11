import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireQuizOwner } from '../middleware/requireQuizOwner.js';
import { requireClassroomOwner, requireClassroomMember } from '../../../middleware/classroomAccess.js';
import {
  createQuiz, getClassroomQuizzes, getQuiz, updateQuiz,
  publishQuiz, duplicateQuiz, archiveQuiz, cancelQuiz,
} from '../controllers/quiz.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

// Classroom-scoped
router.get('/classes/:classId/quizzes', requireClassroomMember, getClassroomQuizzes);
router.post('/classes/:classId/quizzes', authorize('teacher', 'admin'), requireClassroomOwner, createQuiz);

// Quiz-specific
router.get('/quizzes/:quizId', authenticate, getQuiz);
router.patch('/quizzes/:quizId', authorize('teacher', 'admin'), requireQuizOwner, updateQuiz);
router.post('/quizzes/:quizId/publish', authorize('teacher', 'admin'), requireQuizOwner, publishQuiz);
router.post('/quizzes/:quizId/duplicate', authorize('teacher', 'admin'), requireQuizOwner, duplicateQuiz);
router.post('/quizzes/:quizId/archive', authorize('teacher', 'admin'), requireQuizOwner, archiveQuiz);
router.post('/quizzes/:quizId/cancel', authorize('teacher', 'admin'), requireQuizOwner, cancelQuiz);

export default router;
