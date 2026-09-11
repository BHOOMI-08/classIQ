export class LatePolicyService {
  /**
   * Server-authoritative calculation of late penalties.
   */
  static calculatePenalty({ totalMarks, rawMarks, lateByMinutes, latePolicy, allowLateSubmission }) {
    if (!allowLateSubmission || !lateByMinutes || lateByMinutes <= 0) {
      return { penaltyMarks: 0, mode: 'allowed' };
    }

    const { mode, penaltyType, penaltyValue, maximumLateDurationMinutes } = latePolicy || {};

    if (mode === 'blocked') {
      return { penaltyMarks: 0, mode: 'blocked', error: 'Late submissions blocked by policy' };
    }

    if (mode === 'allowed') {
      return { penaltyMarks: 0, mode: 'allowed' };
    }

    if (maximumLateDurationMinutes && lateByMinutes > maximumLateDurationMinutes) {
      return { penaltyMarks: totalMarks, mode: 'blocked', error: 'Exceeded maximum late duration window' };
    }

    let penaltyMarks = 0;
    const lateDays = Math.ceil(lateByMinutes / (60 * 24));

    switch (penaltyType) {
      case 'fixed_marks':
        penaltyMarks = penaltyValue || 0;
        break;

      case 'percentage_total':
        penaltyMarks = (totalMarks * (penaltyValue || 0)) / 100;
        break;

      case 'percentage_per_day':
        penaltyMarks = ((totalMarks * (penaltyValue || 0)) / 100) * lateDays;
        break;

      case 'fixed_per_day':
        penaltyMarks = (penaltyValue || 0) * lateDays;
        break;

      default:
        penaltyMarks = 0;
    }

    // Clamp penalty between 0 and rawMarks
    penaltyMarks = Math.min(rawMarks, Math.max(0, Number(penaltyMarks.toFixed(2))));

    return {
      penaltyMarks,
      mode,
    };
  }
}
