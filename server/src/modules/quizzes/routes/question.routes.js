import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireQuizOwner } from '../middleware/requireQuizOwner.js';
import { requireClassroomOwner } from '../../../middleware/classroomAccess.js';
import { createQuestion, addQuestionToQuiz, getQuizQuestions, getQuestionBank } from '../controllers/question.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

// Question bank for a classroom
router.get('/classes/:classId/question-bank', authorize('teacher', 'admin'), requireClassroomOwner, getQuestionBank);

// Quiz-scoped questions
router.get('/quizzes/:quizId/questions', requireQuizOwner, getQuizQuestions);
router.post('/quizzes/:quizId/questions', authorize('teacher', 'admin'), requireQuizOwner, createQuestion);
router.post('/quizzes/:quizId/questions/add', authorize('teacher', 'admin'), requireQuizOwner, addQuestionToQuiz);

export default router;
