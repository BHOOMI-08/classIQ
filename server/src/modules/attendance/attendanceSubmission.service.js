import { AttendanceSession } from './attendanceSession.model.js';
import { AttendanceRecord } from './attendanceRecord.model.js';
import { AttendanceAttempt } from './attendanceAttempt.model.js';
import { Enrollment } from '../enrollments/enrollment.model.js';
import { SESSION_STATUS, ATTEMPT_RESULT, DECISION, RECORD_STATUS, MARK_SOURCE, SUSPICION_SIGNALS } from './attendance.constants.js';
import { ATTENDANCE_CONFIG } from '../../config/attendance.config.js';
import { CryptoService } from '../../services/crypto.service.js';
import { GeolocationService } from '../../services/geolocation.service.js';
import { SuspicionScoreService } from './suspicionScore.service.js';
import { AttendanceDecisionService } from './attendanceDecision.service.js';
import { TrustedDeviceService } from './trustedDevice.service.js';
import { PresenceChallengeService } from './presenceChallenge.service.js';
import { AttendanceAnalyticsService } from './attendanceAnalytics.service.js';
import { ApiError } from '../../utils/api-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';
import { attendanceEvents, EVENT_TYPES } from './attendanceEventEmitter.js';

export class AttendanceSubmissionService {
  /**
   * Main attendance submission flow for a student scanning a QR code.
   */
  static async submitAttendance({ studentUser, tokenString, location, devicePayload = {}, ipAddress = '', userAgent = '' }) {
    if (!studentUser || studentUser.role !== 'student') {
      throw ApiError.forbidden('Only student accounts can submit attendance');
    }

    const now = Date.now();
    const verificationChecks = {
      signatureValid: false,
      tokenFresh: false,
      sessionActive: false,
      enrollmentActive: false,
      duplicateDetected: false,
      locationProvided: false,
      insideGeofence: true,
      locationAccuracyAcceptable: true,
      deviceRecognized: true,
      challengePassed: true,
      rateLimitPassed: true,
    };

    const suspicionSignals = [];
    let hardRejectionReason = null;

    // 1. Verify QR Token Cryptography
    const tokenResult = CryptoService.verifyQrToken(tokenString);
    if (!tokenResult.valid) {
      verificationChecks.signatureValid = false;
      hardRejectionReason = tokenResult.reason === 'INVALID_SIGNATURE' ? 'Invalid QR code signature' : 'Malformed QR token';
    } else {
      verificationChecks.signatureValid = true;
    }

    const payload = tokenResult.payload || {};

    // 2. Verify Token Expiry with Clock Skew Tolerance
    if (verificationChecks.signatureValid) {
      const clockSkewMs = ATTENDANCE_CONFIG.CLOCK_SKEW_TOLERANCE_SECONDS * 1000;
      if (now > payload.expiresAt + clockSkewMs) {
        verificationChecks.tokenFresh = false;
        hardRejectionReason = 'Expired QR token';
      } else {
        verificationChecks.tokenFresh = true;
      }

      if (payload.issuedAt > now + clockSkewMs) {
        suspicionSignals.push({ code: SUSPICION_SIGNALS.CLOCK_ANOMALY, weight: 15 });
      }
    }

    // 3. Load Session & Classroom
    const sessionId = payload.sessionId;
    const session = sessionId ? await AttendanceSession.findById(sessionId) : null;

    if (!session) {
      hardRejectionReason = hardRejectionReason || 'Attendance session not found';
    } else if (session.status !== SESSION_STATUS.ACTIVE) {
      verificationChecks.sessionActive = false;
      hardRejectionReason = hardRejectionReason || 'Attendance session is not active';
    } else {
      verificationChecks.sessionActive = true;
    }

    // Ensure session IDs match token
    if (session && payload.classroomId && session.classroomId.toString() !== payload.classroomId.toString()) {
      hardRejectionReason = hardRejectionReason || 'Classroom mismatch';
    }

    // 4. Verify Active Enrollment
    const classroomId = session ? session.classroomId : payload.classroomId;
    let enrollment = null;

    if (classroomId) {
      enrollment = await Enrollment.findOne({
        classroomId,
        studentId: studentUser._id,
        status: 'active',
      });

      if (!enrollment) {
        verificationChecks.enrollmentActive = false;
        hardRejectionReason = hardRejectionReason || 'Student is not actively enrolled in this classroom';
      } else {
        verificationChecks.enrollmentActive = true;
      }
    }

    // 5. Check Duplicate Final Attendance Record
    let existingRecord = null;
    if (session) {
      existingRecord = await AttendanceRecord.findOne({
        sessionId: session._id,
        studentId: studentUser._id,
      });

      if (existingRecord) {
        verificationChecks.duplicateDetected = true;
        hardRejectionReason = hardRejectionReason || 'Attendance already recorded for this session';
        suspicionSignals.push({ code: SUSPICION_SIGNALS.DUPLICATE_SUBMISSION, weight: 30 });
      }
    }

    // 6. Geofence Verification
    let studentCoords = null;
    let distanceMeters = null;

    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      verificationChecks.locationProvided = true;
      studentCoords = [location.longitude, location.latitude];

      if (session && session.locationRequired && session.teacherLocation && session.teacherLocation.coordinates) {
        const geoResult = GeolocationService.evaluateGeofence({
          teacherCoords: session.teacherLocation.coordinates,
          studentCoords,
          accuracyMeters: location.accuracyMeters || 0,
          allowedRadiusMeters: session.geofenceRadiusMeters,
        });

        distanceMeters = geoResult.distanceMeters;
        verificationChecks.insideGeofence = geoResult.insideGeofence;
        verificationChecks.locationAccuracyAcceptable = geoResult.accuracyAcceptable;

        if (!geoResult.insideGeofence) {
          suspicionSignals.push({
            code: SUSPICION_SIGNALS.OUTSIDE_GEOFENCE,
            weight: 40,
            details: { distanceMeters, allowedRadius: session.geofenceRadiusMeters },
          });
        }

        if (!geoResult.accuracyAcceptable) {
          suspicionSignals.push({
            code: SUSPICION_SIGNALS.LOCATION_ACCURACY_LOW,
            weight: 15,
            details: { accuracyMeters: location.accuracyMeters },
          });
        }
      }
    } else if (session && session.locationRequired) {
      suspicionSignals.push({ code: SUSPICION_SIGNALS.LOCATION_ACCURACY_LOW, weight: 20 });
    }

    // 7. Device Risk Signals Evaluation
    let deviceEval = { isRecognized: true, signals: [], fingerprintHash: '' };
    if (devicePayload.deviceId) {
      deviceEval = await TrustedDeviceService.evaluateDevice({
        userId: studentUser._id,
        deviceId: devicePayload.deviceId,
        userAgent,
        platform: devicePayload.platform,
        screenResolution: devicePayload.screenResolution,
      });

      verificationChecks.deviceRecognized = deviceEval.isRecognized;
      if (deviceEval.signals && deviceEval.signals.length > 0) {
        suspicionSignals.push(...deviceEval.signals);
      }
    }

    // 8. Calculate Suspicion Score
    const suspicionData = SuspicionScoreService.calculateScore(suspicionSignals);

    // 9. Late Calculation
    let isLate = false;
    let lateByMinutes = 0;
    if (session) {
      const lateBoundary = new Date(new Date(session.startedAt).getTime() + (session.lateAfterMinutes || 5) * 60 * 1000);
      if (new Date() > lateBoundary) {
        isLate = true;
        lateByMinutes = Math.round((Date.now() - lateBoundary.getTime()) / (60 * 1000));
      }
    }

    // 10. Run Decision Engine
    const decisionResult = AttendanceDecisionService.evaluate({
      verificationChecks,
      suspicionData,
      isLate,
      hardRejectionReason,
    });

    // 11. Determine Attempt Result Code
    let result = ATTEMPT_RESULT.ACCEPTED;
    if (decisionResult.decision === DECISION.REJECTED) {
      if (verificationChecks.duplicateDetected) result = ATTEMPT_RESULT.DUPLICATE;
      else if (!verificationChecks.signatureValid) result = ATTEMPT_RESULT.INVALID_SIGNATURE;
      else if (!verificationChecks.tokenFresh) result = ATTEMPT_RESULT.EXPIRED_TOKEN;
      else if (!verificationChecks.sessionActive) result = ATTEMPT_RESULT.SESSION_INACTIVE;
      else if (!verificationChecks.enrollmentActive) result = ATTEMPT_RESULT.NOT_ENROLLED;
      else if (!verificationChecks.insideGeofence) result = ATTEMPT_RESULT.OUTSIDE_GEOFENCE;
      else result = ATTEMPT_RESULT.REJECTED;
    } else if (decisionResult.decision === DECISION.PENDING_REVIEW) {
      result = ATTEMPT_RESULT.FLAGGED;
    }

    const ipHash = CryptoService.hashString(ipAddress);

    // 12. Create AttendanceAttempt Record
    const attempt = await AttendanceAttempt.create({
      sessionId: session ? session._id : payload.sessionId || studentUser._id,
      classroomId: classroomId || studentUser._id,
      studentId: studentUser._id,
      enrollmentId: enrollment ? enrollment._id : null,
      tokenId: payload.tokenId || '',
      tokenRotation: payload.rotation || 0,
      tokenIssuedAt: payload.issuedAt ? new Date(payload.issuedAt) : null,
      tokenExpiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
      tokenNonceHash: payload.nonce ? CryptoService.hashString(payload.nonce) : '',
      result,
      decision: decisionResult.decision,
      rejectionReason: decisionResult.rejectionReason,
      verificationChecks,
      suspicionSignals: suspicionData.signals,
      suspicionScore: suspicionData.score,
      suspicionLevel: suspicionData.level,
      studentLocation: studentCoords
        ? {
            type: 'Point',
            coordinates: studentCoords,
            accuracyMeters: location?.accuracyMeters || 0,
            capturedAt: new Date(),
          }
        : null,
      teacherLocationSnapshot: session?.teacherLocation || null,
      distanceMeters,
      deviceFingerprintHash: deviceEval.fingerprintHash || '',
      deviceSessionId: devicePayload.deviceSessionId || '',
      trustedDeviceId: deviceEval.trustedDevice ? deviceEval.trustedDevice._id : null,
      requestMetadata: {
        ipHash,
        userAgent,
        requestId: `req_${CryptoService.generateNonce(8)}`,
      },
    });

    // 13. Create or Update AttendanceRecord (if accepted or pending review)
    let record = null;
    if (session && enrollment && (decisionResult.decision === DECISION.ACCEPTED || decisionResult.decision === DECISION.PENDING_REVIEW)) {
      try {
        record = await AttendanceRecord.create({
          sessionId: session._id,
          classroomId: session.classroomId,
          studentId: studentUser._id,
          enrollmentId: enrollment._id,
          status: decisionResult.attendanceStatus,
          decision: decisionResult.decision,
          markedAt: new Date(),
          submittedAt: new Date(),
          lateByMinutes,
          verificationSummary: {
            signatureValid: verificationChecks.signatureValid,
            tokenFresh: verificationChecks.tokenFresh,
            enrolled: verificationChecks.enrollmentActive,
            duplicate: false,
            insideGeofence: verificationChecks.insideGeofence,
            locationAccuracyAcceptable: verificationChecks.locationAccuracyAcceptable,
            deviceTrusted: verificationChecks.deviceRecognized,
            presenceChallengePassed: true,
          },
          suspicionScore: suspicionData.score,
          suspicionLevel: suspicionData.level,
          location: studentCoords
            ? {
                type: 'Point',
                coordinates: studentCoords,
                accuracyMeters: location?.accuracyMeters || 0,
                capturedAt: new Date(),
                distanceFromTeacherMeters: distanceMeters,
              }
            : null,
          deviceId: devicePayload.deviceId || '',
          acceptedAttemptId: attempt._id,
          markedBy: studentUser._id,
          markSource: MARK_SOURCE.STUDENT_SCAN,
        });
      } catch (err) {
        if (err.code === 11000) {
          throw ApiError.conflict('Attendance already recorded for this session');
        }
        throw err;
      }
    }

    // 14. Update Session Stats
    if (session) {
      await AttendanceAnalyticsService.recalculateSessionStats(session._id);
    }

    // 15. Audit & Events
    const auditEvent =
      decisionResult.decision === DECISION.ACCEPTED
        ? AUDIT_EVENTS.ATTENDANCE_ATTEMPT_ACCEPTED
        : decisionResult.decision === DECISION.PENDING_REVIEW
        ? AUDIT_EVENTS.ATTENDANCE_ATTEMPT_FLAGGED
        : AUDIT_EVENTS.ATTENDANCE_ATTEMPT_REJECTED;

    await AuditService.log({
      userId: studentUser._id,
      event: auditEvent,
      ipAddress,
      userAgent,
      metadata: {
        sessionId: session?._id,
        classroomId,
        decision: decisionResult.decision,
        reason: decisionResult.rejectionReason,
        suspicionScore: suspicionData.score,
      },
    });

    if (decisionResult.decision === DECISION.ACCEPTED) {
      attendanceEvents.emit(EVENT_TYPES.ATTENDANCE_JOINED, {
        sessionId: session?._id,
        classroomId,
        student: { id: studentUser._id, name: studentUser.name, email: studentUser.email },
        status: decisionResult.attendanceStatus,
        lateByMinutes,
      });
    } else if (decisionResult.decision === DECISION.PENDING_REVIEW) {
      attendanceEvents.emit(EVENT_TYPES.ATTENDANCE_FLAGGED, {
        sessionId: session?._id,
        classroomId,
        studentId: studentUser._id,
        suspicionScore: suspicionData.score,
      });
    }

    if (decisionResult.decision === DECISION.REJECTED) {
      throw ApiError.forbidden(decisionResult.rejectionReason || 'Attendance submission rejected');
    }

    return {
      attempt,
      record,
      decision: decisionResult.decision,
      status: decisionResult.attendanceStatus,
      suspicionLevel: suspicionData.level,
      lateByMinutes,
    };
  }
}
