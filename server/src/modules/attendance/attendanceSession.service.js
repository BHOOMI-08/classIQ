import mongoose from 'mongoose';
import { AttendanceSession } from './attendanceSession.model.js';
import { AttendanceRecord } from './attendanceRecord.model.js';
import { Classroom } from '../classrooms/classroom.model.js';
import { Enrollment } from '../enrollments/enrollment.model.js';
import { SESSION_STATUS, RECORD_STATUS, DECISION, MARK_SOURCE } from './attendance.constants.js';
import { ATTENDANCE_CONFIG } from '../../config/attendance.config.js';
import { CryptoService } from '../../services/crypto.service.js';
import { ApiError } from '../../utils/api-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';
import { attendanceEvents, EVENT_TYPES } from './attendanceEventEmitter.js';
import { AttendanceAnalyticsService } from './attendanceAnalytics.service.js';

export class AttendanceSessionService {
  /**
   * Start a new attendance session for a classroom.
   */
  static async startSession(teacherUser, classroomId, params, ipAddress = '', userAgent = '') {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    if (classroom.status === 'archived') {
      throw ApiError.forbidden('Cannot start attendance for an archived classroom');
    }

    if (teacherUser.role !== 'admin' && classroom.teacherId.toString() !== teacherUser._id.toString()) {
      throw ApiError.forbidden('You are not authorized to start attendance for this classroom');
    }

    // Ensure no existing active session for this classroom
    const activeSession = await AttendanceSession.findOne({
      classroomId: classroom._id,
      status: SESSION_STATUS.ACTIVE,
    });

    if (activeSession) {
      throw ApiError.conflict('An active attendance session already exists for this classroom');
    }

    const durationMinutes = Math.min(
      Math.max(1, params.durationMinutes || ATTENDANCE_CONFIG.DEFAULT_SESSION_MINUTES),
      ATTENDANCE_CONFIG.MAX_SESSION_MINUTES
    );
    const qrRotationSeconds = Math.min(Math.max(5, params.qrRotationSeconds || ATTENDANCE_CONFIG.QR_ROTATION_SECONDS), 60);

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

    const totalEnrolled = await Enrollment.countDocuments({
      classroomId: classroom._id,
      status: 'active',
    });

    let teacherLocation = null;
    if (params.locationRequired && params.teacherLocation) {
      teacherLocation = {
        type: 'Point',
        coordinates: [params.teacherLocation.longitude, params.teacherLocation.latitude],
        accuracyMeters: params.teacherLocation.accuracyMeters || 0,
        capturedAt: new Date(),
      };
    }

    const initialNonce = CryptoService.generateNonce();
    const nonceHash = CryptoService.hashString(initialNonce);

    const session = await AttendanceSession.create({
      classroomId: classroom._id,
      teacherId: teacherUser._id,
      scheduleId: params.scheduleId || null,
      title: params.title || `Attendance - ${classroom.name}`,
      status: SESSION_STATUS.ACTIVE,
      startsAt,
      endsAt,
      startedAt: startsAt,
      durationMinutes,
      qrRotationSeconds,
      currentRotation: 0,
      currentNonceHash: nonceHash,
      teacherLocation,
      geofenceRadiusMeters: Math.min(
        params.geofenceRadiusMeters || ATTENDANCE_CONFIG.DEFAULT_GEOFENCE_METERS,
        ATTENDANCE_CONFIG.MAX_GEOFENCE_METERS
      ),
      locationRequired: Boolean(params.locationRequired),
      lateAfterMinutes: params.lateAfterMinutes ?? ATTENDANCE_CONFIG.LATE_AFTER_MINUTES,
      presenceChallengeEnabled: Boolean(params.presenceChallengeEnabled),
      deviceVerificationEnabled: params.deviceVerificationEnabled !== false,
      manualReviewEnabled: params.manualReviewEnabled !== false,
      stats: {
        totalEnrolled,
        accepted: 0,
        rejected: 0,
        pendingReview: 0,
        late: 0,
        absent: 0,
        suspicious: 0,
        attempts: 0,
      },
    });

    const qrToken = CryptoService.generateQrToken({
      version: 1,
      tokenId: `tk_${session._id}_0`,
      sessionId: session._id,
      classroomId: classroom._id,
      teacherId: teacherUser._id,
      rotation: 0,
      issuedAt: startsAt.getTime(),
      expiresAt: startsAt.getTime() + qrRotationSeconds * 1000,
      nonce: initialNonce,
    });

    await AuditService.log({
      userId: teacherUser._id,
      event: AUDIT_EVENTS.ATTENDANCE_SESSION_STARTED,
      ipAddress,
      userAgent,
      metadata: { sessionId: session._id, classroomId: classroom._id, title: session.title },
    });

    attendanceEvents.emit(EVENT_TYPES.ATTENDANCE_SESSION_STARTED, {
      sessionId: session._id,
      classroomId: classroom._id,
      startedAt: session.startedAt,
    });

    return { session, qrToken };
  }

  /**
   * Generate current QR token string for an active session.
   */
  static async getCurrentQrToken(sessionInput) {
    let session = sessionInput;
    if (typeof sessionInput === 'string' || sessionInput instanceof mongoose.Types.ObjectId) {
      session = await AttendanceSession.findById(sessionInput);
    } else if (sessionInput && typeof sessionInput.save !== 'function' && sessionInput._id) {
      session = await AttendanceSession.findById(sessionInput._id);
    }

    if (!session) {
      throw ApiError.notFound('Attendance session not found');
    }

    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw ApiError.badRequest('Session is not active');
    }

    const now = Date.now();
    const rotationSeconds = session.qrRotationSeconds || ATTENDANCE_CONFIG.QR_ROTATION_SECONDS;
    const elapsedSeconds = Math.floor((now - new Date(session.startedAt).getTime()) / 1000);
    const rotation = Math.max(0, Math.floor(elapsedSeconds / rotationSeconds));

    const nonce = CryptoService.generateNonce();
    const nonceHash = CryptoService.hashString(nonce);

    session.currentRotation = rotation;
    session.currentNonceHash = nonceHash;
    await session.save();

    const issuedAt = now;
    const expiresAt = now + rotationSeconds * 1000;

    const qrToken = CryptoService.generateQrToken({
      version: 1,
      tokenId: `tk_${session._id}_${rotation}`,
      sessionId: session._id,
      classroomId: session.classroomId,
      teacherId: session.teacherId,
      rotation,
      issuedAt,
      expiresAt,
      nonce,
    });

    const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

    return { qrToken, rotation, expiresAt, remainingSeconds };
  }

  /**
   * End an active attendance session and mark absentees for active enrollments without records.
   */
  static async endSession(sessionId, user, reason = 'Teacher ended session', ipAddress = '', userAgent = '') {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      throw ApiError.notFound('Attendance session not found');
    }

    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw ApiError.badRequest(`Session is already ${session.status}`);
    }

    session.status = SESSION_STATUS.ENDED;
    session.endedAt = new Date();
    session.endedBy = user._id;
    session.endReason = reason;

    // Fetch active enrollments
    const activeEnrollments = await Enrollment.find({
      classroomId: session.classroomId,
      status: 'active',
    }).lean();

    // Fetch existing attendance records
    const existingRecords = await AttendanceRecord.find({ sessionId }).lean();
    const recordedStudentIds = new Set(existingRecords.map((r) => r.studentId.toString()));

    const absentDocs = [];
    const now = new Date();

    for (const enrollment of activeEnrollments) {
      const studentIdStr = enrollment.studentId.toString();
      if (!recordedStudentIds.has(studentIdStr)) {
        absentDocs.push({
          sessionId: session._id,
          classroomId: session.classroomId,
          studentId: enrollment.studentId,
          enrollmentId: enrollment._id,
          status: RECORD_STATUS.ABSENT,
          decision: DECISION.ACCEPTED,
          markedAt: now,
          submittedAt: now,
          lateByMinutes: 0,
          markedBy: user._id,
          markSource: MARK_SOURCE.AUTOMATIC_ABSENCE,
          verificationSummary: {
            signatureValid: false,
            tokenFresh: false,
            enrolled: true,
            duplicate: false,
            insideGeofence: false,
            locationAccuracyAcceptable: false,
            deviceTrusted: false,
            presenceChallengePassed: false,
          },
        });
      }
    }

    if (absentDocs.length > 0) {
      try {
        await AttendanceRecord.insertMany(absentDocs, { ordered: false });
      } catch (err) {
        // Ignore duplicate key errors if idempotent retry
      }
    }

    await session.save();
    await AttendanceAnalyticsService.recalculateSessionStats(session._id);

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.ATTENDANCE_SESSION_ENDED,
      ipAddress,
      userAgent,
      metadata: { sessionId: session._id, classroomId: session.classroomId, reason },
    });

    attendanceEvents.emit(EVENT_TYPES.ATTENDANCE_SESSION_ENDED, {
      sessionId: session._id,
      classroomId: session.classroomId,
      endedAt: session.endedAt,
    });

    return session;
  }

  /**
   * Cancel an active attendance session.
   */
  static async cancelSession(sessionId, user, reason = 'Teacher cancelled session', ipAddress = '', userAgent = '') {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      throw ApiError.notFound('Attendance session not found');
    }

    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw ApiError.badRequest(`Session is already ${session.status}`);
    }

    session.status = SESSION_STATUS.CANCELLED;
    session.cancelledAt = new Date();
    session.endedBy = user._id;
    session.endReason = reason;

    await session.save();
    await AttendanceAnalyticsService.recalculateSessionStats(session._id);

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.ATTENDANCE_SESSION_CANCELLED,
      ipAddress,
      userAgent,
      metadata: { sessionId: session._id, classroomId: session.classroomId, reason },
    });

    return session;
  }

  /**
   * Check for expired active sessions and process automatic expiration and absentee marking.
   */
  static async checkAndExpireSessions() {
    const now = new Date();
    const expiredSessions = await AttendanceSession.find({
      status: SESSION_STATUS.ACTIVE,
      endsAt: { $lte: now },
    });

    for (const session of expiredSessions) {
      session.status = SESSION_STATUS.EXPIRED;
      session.endedAt = now;
      session.endReason = 'Session time expired';

      const activeEnrollments = await Enrollment.find({
        classroomId: session.classroomId,
        status: 'active',
      }).lean();

      const existingRecords = await AttendanceRecord.find({ sessionId: session._id }).lean();
      const recordedStudentIds = new Set(existingRecords.map((r) => r.studentId.toString()));

      const absentDocs = [];
      for (const enrollment of activeEnrollments) {
        if (!recordedStudentIds.has(enrollment.studentId.toString())) {
          absentDocs.push({
            sessionId: session._id,
            classroomId: session.classroomId,
            studentId: enrollment.studentId,
            enrollmentId: enrollment._id,
            status: RECORD_STATUS.ABSENT,
            decision: DECISION.ACCEPTED,
            markedAt: now,
            submittedAt: now,
            lateByMinutes: 0,
            markSource: MARK_SOURCE.AUTOMATIC_ABSENCE,
          });
        }
      }

      if (absentDocs.length > 0) {
        try {
          await AttendanceRecord.insertMany(absentDocs, { ordered: false });
        } catch (e) {
          // ignore duplicate key errors
        }
      }

      await session.save();
      await AttendanceAnalyticsService.recalculateSessionStats(session._id);

      await AuditService.log({
        userId: session.teacherId,
        event: AUDIT_EVENTS.ATTENDANCE_SESSION_EXPIRED,
        metadata: { sessionId: session._id, classroomId: session.classroomId },
      });
    }
  }
}
