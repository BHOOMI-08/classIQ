import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { getClassroomTimeline } from '../controllers/classroomTimeline.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/classes/:classId/timeline', getClassroomTimeline);

export default router;
