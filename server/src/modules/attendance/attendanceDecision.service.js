import { DECISION, RECORD_STATUS } from './attendance.constants.js';

export class AttendanceDecisionService {
  /**
   * Evaluate all checks and suspicion data to produce a final attendance decision.
   */
  static evaluate({ verificationChecks, suspicionData, isLate = false, hardRejectionReason = null }) {
    const { score: suspicionScore, level: suspicionLevel, signals } = suspicionData;

    // Hard Rejection Check
    if (hardRejectionReason) {
      return {
        decision: DECISION.REJECTED,
        attendanceStatus: RECORD_STATUS.REJECTED,
        rejectionReason: hardRejectionReason,
        suspicionScore,
        suspicionLevel,
        signals,
        requiresManualReview: false,
      };
    }

    // Explicit Verification Failures
    if (!verificationChecks.signatureValid) {
      return {
        decision: DECISION.REJECTED,
        attendanceStatus: RECORD_STATUS.REJECTED,
        rejectionReason: 'Invalid QR code signature',
        suspicionScore,
        suspicionLevel,
        signals,
        requiresManualReview: false,
      };
    }

    if (!verificationChecks.tokenFresh) {
      return {
        decision: DECISION.REJECTED,
        attendanceStatus: RECORD_STATUS.REJECTED,
        rejectionReason: 'Expired QR token',
        suspicionScore,
        suspicionLevel,
        signals,
        requiresManualReview: false,
      };
    }

    if (!verificationChecks.sessionActive) {
      return {
        decision: DECISION.REJECTED,
        attendanceStatus: RECORD_STATUS.REJECTED,
        rejectionReason: 'Attendance session is not active',
        suspicionScore,
        suspicionLevel,
        signals,
        requiresManualReview: false,
      };
    }

    if (!verificationChecks.enrollmentActive) {
      return {
        decision: DECISION.REJECTED,
        attendanceStatus: RECORD_STATUS.REJECTED,
        rejectionReason: 'Student is not actively enrolled in this classroom',
        suspicionScore,
        suspicionLevel,
        signals,
        requiresManualReview: false,
      };
    }

    if (verificationChecks.duplicateDetected) {
      return {
        decision: DECISION.REJECTED,
        attendanceStatus: RECORD_STATUS.REJECTED,
        rejectionReason: 'Attendance already recorded for this session',
        suspicionScore,
        suspicionLevel,
        signals,
        requiresManualReview: false,
      };
    }

    // Geofence & Location Strict Failure
    if (verificationChecks.locationProvided && !verificationChecks.insideGeofence && suspicionScore >= 70) {
      return {
        decision: DECISION.REJECTED,
        attendanceStatus: RECORD_STATUS.REJECTED,
        rejectionReason: 'Outside allowed classroom geofence boundary',
        suspicionScore,
        suspicionLevel,
        signals,
        requiresManualReview: false,
      };
    }

    // Pending Review Conditions
    if (
      suspicionData.recommendedDecision === DECISION.PENDING_REVIEW ||
      !verificationChecks.insideGeofence ||
      !verificationChecks.locationAccuracyAcceptable ||
      !verificationChecks.challengePassed
    ) {
      return {
        decision: DECISION.PENDING_REVIEW,
        attendanceStatus: RECORD_STATUS.PENDING_REVIEW,
        rejectionReason: null,
        suspicionScore,
        suspicionLevel,
        signals,
        requiresManualReview: true,
      };
    }

    // Accepted Condition
    const attendanceStatus = isLate ? RECORD_STATUS.LATE : RECORD_STATUS.PRESENT;
    return {
      decision: DECISION.ACCEPTED,
      attendanceStatus,
      rejectionReason: null,
      suspicionScore,
      suspicionLevel,
      signals,
      requiresManualReview: false,
    };
  }
}
