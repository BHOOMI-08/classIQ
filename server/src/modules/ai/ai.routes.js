import { Router } from 'express';
import tutorRoutes from './routes/tutor.routes.js';
import studyPlannerRoutes from './routes/study-planner.routes.js';
import revisionRoutes from './routes/revision.routes.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { generateLecturePlan, getWeaknessMap } from './ai.controller.js';

const router = Router();

// Module 7 Core AI Suite Routers
router.use('/tutor', tutorRoutes);
router.use('/study-plans', studyPlannerRoutes);
router.use('/revision', revisionRoutes);

// Helper & Backward-Compatibility Routes for System Readiness
router.post('/teacher/lecture-plans', authenticate, authorize('teacher', 'admin'), generateLecturePlan);
router.get('/weakness-map', authenticate, authorize('student'), getWeaknessMap);

export default router;
