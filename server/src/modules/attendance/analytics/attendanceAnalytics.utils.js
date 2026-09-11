import { ATTENDANCE_POLICY, HEALTH_STATUS, TREND_STATUS } from './attendanceAnalytics.constants.js';

/**
 * Calculate total attended equivalent based on status weights.
 */
export const calculateAttendedEquivalent = (records = [], policy = ATTENDANCE_POLICY) => {
  let equivalent = 0;
  for (const record of records) {
    const status = record.status;
    if (status === 'pending_review' && policy.PENDING_REVIEW_MODE === 'exclude') {
      continue;
    }
    const weight = policy.STATUS_WEIGHTS[status] ?? 0;
    equivalent += weight;
  }
  return Math.round(equivalent * 100) / 100;
};

/**
 * Calculate attendance percentage with 2 decimal precision.
 */
export const calculateAttendancePercentage = (attendedEquivalent, eligibleSessions) => {
  if (!eligibleSessions || eligibleSessions <= 0) return null;
  const raw = (attendedEquivalent / eligibleSessions) * 100;
  return Math.round(raw * 100) / 100;
};

/**
 * Calculate safe leaves allowance: floor((A / P) - T)
 */
export const calculateSafeLeaves = (attendedEquivalent, eligibleSessions, thresholdPercent = 75) => {
  if (eligibleSessions <= 0 || thresholdPercent <= 0 || thresholdPercent > 100) return 0;
  const P = thresholdPercent / 100;
  const maxSessionsAllowed = Math.floor(attendedEquivalent / P);
  return Math.max(0, maxSessionsAllowed - eligibleSessions);
};

/**
 * Calculate recovery classes required: ceil((P * T - A) / (1 - P))
 */
export const calculateRecoveryClasses = (attendedEquivalent, eligibleSessions, thresholdPercent = 75) => {
  if (eligibleSessions <= 0 || thresholdPercent <= 0 || thresholdPercent >= 100) return 0;
  const P = thresholdPercent / 100;
  const requiredTotal = P * eligibleSessions;

  if (attendedEquivalent >= requiredTotal) return 0;

  const requiredClasses = Math.ceil((requiredTotal - attendedEquivalent) / (1 - P));
  return Math.max(0, requiredClasses);
};

/**
 * Scenario-based forecast calculation.
 */
export const calculateScenarioForecast = (attendedEquivalent, eligibleSessions, futureAttended = 0, futureMissed = 0) => {
  const newT = eligibleSessions + futureAttended + futureMissed;
  const newA = attendedEquivalent + futureAttended;
  if (newT <= 0) return 100;
  return Math.round((newA / newT) * 10000) / 100;
};

/**
 * Calculate consecutive streaks (attendance, absence, on-time).
 */
export const calculateStreaks = (records = []) => {
  // Sort records chronologically
  const sorted = [...records].sort((a, b) => new Date(a.markedAt || a.createdAt) - new Date(b.markedAt || b.createdAt));

  let currentAttendanceStreak = 0;
  let longestAttendanceStreak = 0;
  let currentAbsenceStreak = 0;
  let longestAbsenceStreak = 0;
  let currentOnTimeStreak = 0;
  let longestOnTimeStreak = 0;

  let tempAtt = 0;
  let tempAbs = 0;
  let tempOnTime = 0;

  for (const r of sorted) {
    const isAttended = ['present', 'late', 'excused'].includes(r.status);
    const isAbsence = ['absent', 'rejected'].includes(r.status);
    const isOnTime = r.status === 'present';

    if (isAttended) {
      tempAtt++;
      if (tempAtt > longestAttendanceStreak) longestAttendanceStreak = tempAtt;
      tempAbs = 0;
    } else if (isAbsence) {
      tempAbs++;
      if (tempAbs > longestAbsenceStreak) longestAbsenceStreak = tempAbs;
      tempAtt = 0;
    }

    if (isOnTime) {
      tempOnTime++;
      if (tempOnTime > longestOnTimeStreak) longestOnTimeStreak = tempOnTime;
    } else {
      tempOnTime = 0;
    }
  }

  currentAttendanceStreak = tempAtt;
  currentAbsenceStreak = tempAbs;
  currentOnTimeStreak = tempOnTime;

  return {
    currentAttendanceStreak,
    longestAttendanceStreak,
    currentAbsenceStreak,
    longestAbsenceStreak,
    currentOnTimeStreak,
    longestOnTimeStreak,
  };
};

/**
 * Determine attendance health status label.
 */
export const determineHealthStatus = (percentage, thresholdPercent = 75, safeLeaves = 0, recoveryClasses = 0) => {
  if (percentage === null || percentage === undefined) return HEALTH_STATUS.NO_DATA;

  const warningBuffer = ATTENDANCE_POLICY.THRESHOLD_WARNING_BUFFER;

  if (percentage >= thresholdPercent + warningBuffer) {
    return HEALTH_STATUS.ON_TRACK;
  }
  if (percentage >= thresholdPercent) {
    return HEALTH_STATUS.NEAR_THRESHOLD;
  }
  if (percentage >= thresholdPercent - warningBuffer || recoveryClasses <= 5) {
    return HEALTH_STATUS.AT_RISK;
  }
  return HEALTH_STATUS.CRITICAL;
};

/**
 * Calculate period-over-period comparison metrics.
 */
export const calculatePeriodComparison = (currentPct, previousPct) => {
  if (currentPct === null || previousPct === null) {
    return { percentagePointsChange: 0, relativePercentageChange: 0, direction: 'stable' };
  }

  const percentagePointsChange = Math.round((currentPct - previousPct) * 100) / 100;
  const relativePercentageChange = previousPct > 0 ? Math.round(((currentPct - previousPct) / previousPct) * 10000) / 100 : 0;

  let direction = 'stable';
  if (percentagePointsChange > 1) direction = 'improving';
  else if (percentagePointsChange < -1) direction = 'declining';

  return {
    percentagePointsChange,
    relativePercentageChange,
    direction,
  };
};
