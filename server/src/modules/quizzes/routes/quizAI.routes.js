import express from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireClassroomOwner } from '../../../middleware/classroomAccess.js';
import { generateQuizWithAI } from '../controllers/quizAI.controller.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.post('/classes/:classId/quizzes/ai/generate', authorize('teacher', 'admin'), requireClassroomOwner, generateQuizWithAI);

export default router;
