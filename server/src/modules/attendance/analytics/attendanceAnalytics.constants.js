export const ATTENDANCE_POLICY = Object.freeze({
  STATUS_WEIGHTS: Object.freeze({
    present: 1.0,
    late: 1.0,
    excused: 1.0,
    absent: 0.0,
    rejected: 0.0,
  }),
  PENDING_REVIEW_MODE: 'exclude', // 'exclude' | 'count_as_absent' | 'count_as_attended'
  THRESHOLD_WARNING_BUFFER: 5, // Percentage points buffer above threshold for 'near_threshold'
});

export const HEALTH_STATUS = Object.freeze({
  NO_DATA: 'no_data',
  ON_TRACK: 'on_track',
  NEAR_THRESHOLD: 'near_threshold',
  AT_RISK: 'at_risk',
  CRITICAL: 'critical',
});

export const TREND_STATUS = Object.freeze({
  IMPROVING: 'improving',
  STABLE: 'stable',
  DECLINING: 'declining',
  INSUFFICIENT_DATA: 'insufficient_data',
});
