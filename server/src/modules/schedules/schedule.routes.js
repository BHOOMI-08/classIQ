import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { requireClassroomOwner, requireClassroomMember, requireActiveClassroom } from '../../middleware/classroomAccess.js';
import { createScheduleSchema, updateScheduleSchema } from './schedule.validation.js';

import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from './schedule.controller.js';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  authenticate,
  requireClassroomMember,
  getSchedules
);

router.post(
  '/',
  authenticate,
  requireClassroomOwner,
  requireActiveClassroom,
  validate(createScheduleSchema),
  createSchedule
);

router.patch(
  '/:scheduleId',
  authenticate,
  requireClassroomOwner,
  requireActiveClassroom,
  validate(updateScheduleSchema),
  updateSchedule
);

router.delete(
  '/:scheduleId',
  authenticate,
  requireClassroomOwner,
  requireActiveClassroom,
  deleteSchedule
);

export default router;
