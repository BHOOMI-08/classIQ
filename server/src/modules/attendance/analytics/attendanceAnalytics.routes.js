import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireClassroomOwner } from '../../../middleware/classroomAccess.js';
import { AttendanceAnalyticsController } from './attendanceAnalytics.controller.js';

const router = Router();

router.use(authenticate);

// Student Analytics Routes
router.get(
  '/me/health',
  authorize('student'),
  AttendanceAnalyticsController.getStudentHealth
);

router.get(
  '/me/classes/:classroomId/health',
  authorize('student'),
  AttendanceAnalyticsController.getStudentClassHealth
);

// Teacher Analytics Routes
router.get(
  '/classrooms/:classroomId/overview',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  AttendanceAnalyticsController.getClassroomOverview
);

router.get(
  '/classrooms/:classroomId/trends',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  AttendanceAnalyticsController.getClassroomTrends
);

router.get(
  '/classrooms/:classroomId/sessions',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  AttendanceAnalyticsController.getSessionAnalyticsList
);

router.get(
  '/classrooms/:classroomId/security',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  AttendanceAnalyticsController.getSecurityAnalytics
);

router.get(
  '/classrooms/:classroomId/students/:studentId',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  AttendanceAnalyticsController.getStudentInsight
);

export default router;
