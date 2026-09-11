import { AttendanceRecord } from './attendanceRecord.model.js';
import { AttendanceCorrection } from './attendanceCorrection.model.js';
import { Classroom } from '../classrooms/classroom.model.js';
import { DECISION, CORRECTION_TYPES } from './attendance.constants.js';
import { ApiError } from '../../utils/api-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';
import { AttendanceAnalyticsService } from './attendanceAnalytics.service.js';
import { CryptoService } from '../../services/crypto.service.js';

export class AttendanceCorrectionService {
  /**
   * Correct an existing attendance record status with mandatory reason and immutable audit log.
   */
  static async correctRecord(recordId, teacherUser, { newStatus, reason, evidence = '' }, ipAddress = '', userAgent = '') {
    if (!reason || reason.trim().length < 5) {
      throw ApiError.badRequest('Correction reason must be at least 5 characters long');
    }

    const record = await AttendanceRecord.findById(recordId);
    if (!record) {
      throw ApiError.notFound('Attendance record not found');
    }

    const classroom = await Classroom.findById(record.classroomId);
    if (!classroom) {
      throw ApiError.notFound('Associated classroom not found');
    }

    if (teacherUser.role !== 'admin' && classroom.teacherId.toString() !== teacherUser._id.toString()) {
      throw ApiError.forbidden('You are not authorized to modify attendance for this classroom');
    }

    const previousStatus = record.status;
    const previousDecision = record.decision;
    const newDecision = DECISION.ACCEPTED;

    const correction = await AttendanceCorrection.create({
      attendanceRecordId: record._id,
      sessionId: record.sessionId,
      classroomId: record.classroomId,
      studentId: record.studentId,
      previousStatus,
      newStatus,
      previousDecision,
      newDecision,
      reason: reason.trim(),
      correctionType: CORRECTION_TYPES.STATUS_CHANGE,
      correctedBy: teacherUser._id,
      correctedAt: new Date(),
      evidence: evidence ? String(evidence) : '',
      requestMetadata: {
        ipHash: CryptoService.hashString(ipAddress),
        userAgent,
      },
    });

    record.status = newStatus;
    record.decision = newDecision;
    record.markedBy = teacherUser._id;
    record.correctionCount = (record.correctionCount || 0) + 1;
    record.lastCorrectedAt = new Date();

    await record.save();
    await AttendanceAnalyticsService.recalculateSessionStats(record.sessionId);

    await AuditService.log({
      userId: teacherUser._id,
      event: AUDIT_EVENTS.ATTENDANCE_RECORD_CORRECTED,
      ipAddress,
      userAgent,
      metadata: {
        recordId: record._id,
        sessionId: record.sessionId,
        previousStatus,
        newStatus,
        reason,
      },
    });

    return { record, correction };
  }

  /**
   * Get correction history for a record.
   */
  static async getCorrectionHistory(recordId) {
    return AttendanceCorrection.find({ attendanceRecordId: recordId })
      .populate('correctedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();
  }
}
