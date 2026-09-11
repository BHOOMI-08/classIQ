import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { requireClassroomOwner, requireClassroomMember, requireActiveClassroom } from '../../middleware/classroomAccess.js';
import { createAnnouncementSchema, updateAnnouncementSchema } from './announcement.validation.js';

import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
} from './announcement.controller.js';

const router = express.Router({ mergeParams: true });

// Nested under /api/v1/classrooms/:classId/announcements or top-level /api/v1/announcements
router.get(
  '/',
  authenticate,
  requireClassroomMember,
  getAnnouncements
);

router.post(
  '/',
  authenticate,
  requireClassroomOwner,
  requireActiveClassroom,
  validate(createAnnouncementSchema),
  createAnnouncement
);

router.patch(
  '/:announcementId',
  authenticate,
  validate(updateAnnouncementSchema),
  updateAnnouncement
);

router.post(
  '/:announcementId/publish',
  authenticate,
  publishAnnouncement
);

router.post(
  '/:announcementId/archive',
  authenticate,
  archiveAnnouncement
);

export default router;
