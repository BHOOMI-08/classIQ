import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireAssignmentAccess } from '../middleware/requireAssignmentAccess.js';
import * as analyticsController from '../controllers/assignmentAnalytics.controller.js';

const router = Router();

router.use(authenticate);

router.get('/assignments/:assignmentId/analytics', requireAssignmentAccess, analyticsController.getAssignmentAnalytics);

export default router;
