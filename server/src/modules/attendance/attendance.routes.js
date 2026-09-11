import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { requireClassroomOwner, requireClassroomMember } from '../../middleware/classroomAccess.js';
import { requireAttendanceSessionOwner, requireAttendanceSessionMember } from '../../middleware/attendanceAccess.js';

import { AttendanceSessionController } from './attendanceSession.controller.js';
import { AttendanceRecordController } from './attendanceRecord.controller.js';
import { AttendanceAttemptController } from './attendanceAttempt.controller.js';
import { AttendanceCorrectionController } from './attendanceCorrection.controller.js';
import { AttendanceAnalyticsController } from './attendanceAnalytics.controller.js';
import { AttendanceExportController } from './attendanceExport.controller.js';
import { TrustedDeviceController } from './trustedDevice.controller.js';

import { startSessionSchema, endSessionSchema } from './attendanceSession.validation.js';
import { submitAttendanceSchema } from './attendanceSubmission.validation.js';
import { correctRecordSchema } from './attendanceCorrection.validation.js';
import { registerDeviceSchema } from './trustedDevice.validation.js';

const router = Router();

// Require authentication for all attendance endpoints
router.use(authenticate);

/**
 * Session Lifecycle Endpoints
 */
router.post(
  ['/classrooms/:classId/sessions', '/classrooms/:classId/attendance/sessions', '/classrooms/:classroomId/sessions'],
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  validate(startSessionSchema),
  AttendanceSessionController.startSession
);

router.get(
  ['/classrooms/:classId/active-session', '/classrooms/:classroomId/active-session'],
  requireClassroomMember,
  AttendanceSessionController.getActiveSession
);

router.get(
  '/sessions/:sessionId/qr-token',
  authorize('teacher', 'admin'),
  requireAttendanceSessionOwner,
  AttendanceSessionController.getCurrentToken
);

router.post(
  '/sessions/:sessionId/end',
  authorize('teacher', 'admin'),
  requireAttendanceSessionOwner,
  validate(endSessionSchema),
  AttendanceSessionController.endSession
);

router.post(
  '/sessions/:sessionId/cancel',
  authorize('teacher', 'admin'),
  requireAttendanceSessionOwner,
  validate(endSessionSchema),
  AttendanceSessionController.cancelSession
);

/**
 * Submissions & Attempts Endpoints
 */
router.post(
  '/submit',
  authorize('student'),
  validate(submitAttendanceSchema),
  AttendanceSessionController.submitAttendance
);

router.get(
  '/sessions/:sessionId/attempts',
  authorize('teacher', 'admin'),
  requireAttendanceSessionOwner,
  AttendanceAttemptController.getSessionAttempts
);

/**
 * Records & History Endpoints
 */
router.get(
  '/sessions/:sessionId/records',
  authorize('teacher', 'admin'),
  requireAttendanceSessionOwner,
  AttendanceRecordController.getSessionRecords
);

router.get(
  '/my-records',
  authorize('student'),
  AttendanceRecordController.getStudentRecords
);

/**
 * Corrections & Overrides
 */
router.post(
  '/records/:recordId/correct',
  authorize('teacher', 'admin'),
  validate(correctRecordSchema),
  AttendanceCorrectionController.correctRecord
);

router.get(
  '/records/:recordId/corrections',
  authorize('teacher', 'admin'),
  AttendanceCorrectionController.getCorrectionHistory
);

/**
 * Student Health, Safe Leave & Recovery Analytics
 */
router.get(
  '/me/health',
  authorize('student'),
  AttendanceAnalyticsController.getMyHealth
);

router.get(
  '/me/classes/:classroomId/health',
  authorize('student'),
  AttendanceAnalyticsController.getClassHealth
);

router.get(
  '/me/classes/:classroomId/forecast',
  authorize('student'),
  AttendanceAnalyticsController.getForecast
);

router.post(
  '/sessions/:sessionId/recalculate-stats',
  authorize('teacher', 'admin'),
  requireAttendanceSessionOwner,
  AttendanceAnalyticsController.recalculateSessionStats
);

/**
 * CSV Export Endpoints
 */
router.get(
  '/sessions/:sessionId/export',
  authorize('teacher', 'admin'),
  requireAttendanceSessionOwner,
  AttendanceExportController.exportSessionCsv
);

router.get(
  '/classrooms/:classroomId/export',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  AttendanceExportController.exportClassroomCsv
);

/**
 * Trusted Device Endpoints
 */
router.post(
  '/devices',
  validate(registerDeviceSchema),
  TrustedDeviceController.registerDevice
);

router.get(
  '/devices',
  TrustedDeviceController.getUserDevices
);

export default router;
