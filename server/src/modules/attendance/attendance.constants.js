export const SESSION_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
});

export const DECISION = Object.freeze({
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PENDING_REVIEW: 'pending_review',
});

export const RECORD_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  PENDING_REVIEW: 'pending_review',
  REJECTED: 'rejected',
});

export const ATTEMPT_RESULT = Object.freeze({
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
  DUPLICATE: 'duplicate',
  EXPIRED_TOKEN: 'expired_token',
  INVALID_SIGNATURE: 'invalid_signature',
  OUTSIDE_GEOFENCE: 'outside_geofence',
  NOT_ENROLLED: 'not_enrolled',
  SESSION_INACTIVE: 'session_inactive',
  CHALLENGE_FAILED: 'challenge_failed',
  RATE_LIMITED: 'rate_limited',
  DEVICE_RISK: 'device_risk',
  LOCATION_UNAVAILABLE: 'location_unavailable',
});

export const VERIFICATION_CHECK = Object.freeze({
  TOKEN_SIGNATURE: 'token_signature',
  TOKEN_EXPIRY: 'token_expiry',
  SESSION_STATE: 'session_state',
  ENROLLMENT: 'enrollment',
  DUPLICATE: 'duplicate',
  GEOFENCE: 'geofence',
  DEVICE: 'device',
  PRESENCE_CHALLENGE: 'presence_challenge',
  RATE_LIMIT: 'rate_limit',
});

export const SUSPICION_LEVELS = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

export const MARK_SOURCE = Object.freeze({
  STUDENT_SCAN: 'student_scan',
  AUTOMATIC_ABSENCE: 'automatic_absence',
  TEACHER_MANUAL: 'teacher_manual',
  CORRECTION: 'correction',
  SYSTEM_REVIEW: 'system_review',
});

export const CORRECTION_TYPES = Object.freeze({
  STATUS_CHANGE: 'status_change',
  MARK_PRESENT: 'mark_present',
  MARK_ABSENT: 'mark_absent',
  MARK_LATE: 'mark_late',
  MARK_EXCUSED: 'mark_excused',
  APPROVE_PENDING: 'approve_pending',
  REJECT_PENDING: 'reject_pending',
});

export const TRUST_STATUS = Object.freeze({
  UNVERIFIED: 'unverified',
  TRUSTED: 'trusted',
  SUSPICIOUS: 'suspicious',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
});

export const PRESENCE_CHALLENGE_TYPES = Object.freeze({
  TAP_CONFIRMATION: 'tap_confirmation',
  CODE_MATCH: 'code_match',
  VISUAL_CHOICE: 'visual_choice',
  SHORT_RESPONSE: 'short_response',
});

export const SUSPICION_SIGNALS = Object.freeze({
  LOCATION_ACCURACY_LOW: 'LOCATION_ACCURACY_LOW',
  OUTSIDE_GEOFENCE: 'OUTSIDE_GEOFENCE',
  TOKEN_NEAR_EXPIRY: 'TOKEN_NEAR_EXPIRY',
  REPEATED_FAILED_ATTEMPTS: 'REPEATED_FAILED_ATTEMPTS',
  NEW_DEVICE: 'NEW_DEVICE',
  MULTIPLE_ACCOUNTS_SAME_DEVICE: 'MULTIPLE_ACCOUNTS_SAME_DEVICE',
  DEVICE_SESSION_MISMATCH: 'DEVICE_SESSION_MISMATCH',
  LOCATION_JUMP: 'LOCATION_JUMP',
  CHALLENGE_FAILED: 'CHALLENGE_FAILED',
  CLOCK_ANOMALY: 'CLOCK_ANOMALY',
  IP_ANOMALY: 'IP_ANOMALY',
  REPLAY_ATTEMPT: 'REPLAY_ATTEMPT',
  DUPLICATE_SUBMISSION: 'DUPLICATE_SUBMISSION',
  AUTOMATION_PATTERN: 'AUTOMATION_PATTERN',
});
