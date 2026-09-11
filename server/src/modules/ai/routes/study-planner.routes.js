import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import {
  createStudyPlan,
  getStudyPlans,
  updateStudyPlanTask,
  recalculateStudyPlan,
} from '../controllers/study-planner.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize('student'));

router.post('/', createStudyPlan);
router.get('/', getStudyPlans);
router.patch('/:id', updateStudyPlanTask);
router.post('/:id/recalculate', recalculateStudyPlan);

export default router;
