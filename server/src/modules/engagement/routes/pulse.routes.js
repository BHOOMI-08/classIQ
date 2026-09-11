import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { validate } from '../../../middleware/validate.js';
import { createPulseSchema, respondPulseSchema } from '../validation/engagement.validation.js';
import {
  createPulse,
  getClassroomPulses,
  getPulseById,
  respondPulse,
  closePulse,
} from '../controllers/pulse.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/classes/:classId/pulses', authorize('teacher', 'admin'), validate(createPulseSchema), createPulse);
router.get('/classes/:classId/pulses', getClassroomPulses);
router.get('/pulses/:pulseId', getPulseById);
router.post('/student/pulses/:pulseId/respond', authorize('student'), validate(respondPulseSchema), respondPulse);
router.post('/pulses/:pulseId/close', authorize('teacher', 'admin'), closePulse);

export default router;
