import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { requireClassroomOwner, requireClassroomMember, requireActiveClassroom } from '../../middleware/classroomAccess.js';
import { createClassroomSchema, updateClassroomSchema } from './classroom.validation.js';
import { blockStudentSchema } from '../enrollments/enrollment.validation.js';

import {
  createClassroom,
  getTeacherClassrooms,
  getClassroomDetails,
  updateClassroom,
  archiveClassroom,
  restoreClassroom,
  regenerateJoinCode,
} from './classroom.controller.js';

import {
  getClassroomStudents,
  removeStudent,
  blockStudent,
  unblockStudent,
} from '../enrollments/enrollment.controller.js';

const router = express.Router();

// Teacher Classroom Routes
router.post(
  '/',
  authenticate,
  authorize('teacher', 'admin'),
  validate(createClassroomSchema),
  createClassroom
);

router.get(
  '/teacher',
  authenticate,
  authorize('teacher', 'admin'),
  getTeacherClassrooms
);

router.get(
  '/:classId',
  authenticate,
  requireClassroomMember,
  getClassroomDetails
);

router.patch(
  '/:classId',
  authenticate,
  requireClassroomOwner,
  requireActiveClassroom,
  validate(updateClassroomSchema),
  updateClassroom
);

router.post(
  '/:classId/archive',
  authenticate,
  requireClassroomOwner,
  archiveClassroom
);

router.post(
  '/:classId/restore',
  authenticate,
  requireClassroomOwner,
  restoreClassroom
);

router.post(
  '/:classId/regenerate-code',
  authenticate,
  requireClassroomOwner,
  requireActiveClassroom,
  regenerateJoinCode
);

// Teacher Student Roster Management Routes
router.get(
  '/:classId/students',
  authenticate,
  requireClassroomOwner,
  getClassroomStudents
);

router.patch(
  '/:classId/students/:studentId/remove',
  authenticate,
  requireClassroomOwner,
  removeStudent
);

router.patch(
  '/:classId/students/:studentId/block',
  authenticate,
  requireClassroomOwner,
  validate(blockStudentSchema),
  blockStudent
);

router.patch(
  '/:classId/students/:studentId/unblock',
  authenticate,
  requireClassroomOwner,
  unblockStudent
);

export default router;
