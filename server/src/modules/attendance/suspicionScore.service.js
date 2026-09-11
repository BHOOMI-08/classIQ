import { SUSPICION_LEVELS, SUSPICION_SIGNALS } from './attendance.constants.js';
import { ATTENDANCE_CONFIG } from '../../config/attendance.config.js';

export class SuspicionScoreService {
  static SIGNAL_WEIGHTS = Object.freeze({
    [SUSPICION_SIGNALS.LOCATION_ACCURACY_LOW]: 15,
    [SUSPICION_SIGNALS.OUTSIDE_GEOFENCE]: 40,
    [SUSPICION_SIGNALS.TOKEN_NEAR_EXPIRY]: 5,
    [SUSPICION_SIGNALS.REPEATED_FAILED_ATTEMPTS]: 20,
    [SUSPICION_SIGNALS.NEW_DEVICE]: 10,
    [SUSPICION_SIGNALS.MULTIPLE_ACCOUNTS_SAME_DEVICE]: 35,
    [SUSPICION_SIGNALS.DEVICE_SESSION_MISMATCH]: 20,
    [SUSPICION_SIGNALS.LOCATION_JUMP]: 25,
    [SUSPICION_SIGNALS.CHALLENGE_FAILED]: 30,
    [SUSPICION_SIGNALS.CLOCK_ANOMALY]: 10,
    [SUSPICION_SIGNALS.IP_ANOMALY]: 15,
    [SUSPICION_SIGNALS.REPLAY_ATTEMPT]: 45,
    [SUSPICION_SIGNALS.DUPLICATE_SUBMISSION]: 30,
    [SUSPICION_SIGNALS.AUTOMATION_PATTERN]: 35,
  });

  /**
   * Evaluate a list of signal codes and calculate a suspicion score (0-100) and level.
   */
  static calculateScore(signals = []) {
    let totalScore = 0;
    const evaluatedSignals = [];

    for (const item of signals) {
      const code = typeof item === 'string' ? item : item.code;
      const details = typeof item === 'object' ? item.details || {} : {};
      const baseWeight = this.SIGNAL_WEIGHTS[code] || 10;
      const weight = typeof item === 'object' && typeof item.weight === 'number' ? item.weight : baseWeight;

      totalScore += weight;
      evaluatedSignals.push({ code, weight, details });
    }

    const clampedScore = Math.min(100, Math.max(0, totalScore));
    const level = this.getSuspicionLevel(clampedScore);
    const recommendedDecision = this.getRecommendedDecision(clampedScore);

    return {
      score: clampedScore,
      level,
      signals: evaluatedSignals,
      recommendedDecision,
    };
  }

  static getSuspicionLevel(score) {
    if (score < 20) return SUSPICION_LEVELS.LOW;
    if (score < 40) return SUSPICION_LEVELS.MEDIUM;
    if (score < 70) return SUSPICION_LEVELS.HIGH;
    return SUSPICION_LEVELS.CRITICAL;
  }

  static getRecommendedDecision(score) {
    if (score >= ATTENDANCE_CONFIG.SUSPICION_REJECT_THRESHOLD) {
      return 'rejected';
    }
    if (score >= ATTENDANCE_CONFIG.SUSPICION_REVIEW_THRESHOLD) {
      return 'pending_review';
    }
    return 'accepted';
  }
}
