import { Router } from 'express';
import { authenticate } from '../../../middleware/authenticate.js';
import { authorize } from '../../../middleware/authorize.js';
import { requireClassroomOwner } from '../../../middleware/classroomAccess.js';
import { AttendanceReportController } from './attendanceReport.controller.js';

const router = Router();

router.use(authenticate);

router.get(
  '/classrooms/:classroomId/csv',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  AttendanceReportController.exportClassroomCsv
);

router.get(
  '/classrooms/:classroomId/pdf',
  authorize('teacher', 'admin'),
  requireClassroomOwner,
  AttendanceReportController.exportClassroomPdf
);

export default router;
