import {
  calculateAttendedEquivalent,
  calculateAttendancePercentage,
  calculateSafeLeaves,
  calculateRecoveryClasses,
  calculateScenarioForecast,
  calculateStreaks,
  determineHealthStatus,
} from '../src/modules/attendance/analytics/attendanceAnalytics.utils.js';

describe('Attendance Analytics Math Calculations', () => {
  test('calculateAttendedEquivalent correctly applies status weights', () => {
    const records = [
      { status: 'present' },
      { status: 'late' },
      { status: 'excused' },
      { status: 'absent' },
      { status: 'rejected' },
    ];
    const eq = calculateAttendedEquivalent(records);
    expect(eq).toBe(3); // 1 + 1 + 1 + 0 + 0 = 3
  });

  test('calculateAttendancePercentage handles normal and zero cases', () => {
    expect(calculateAttendancePercentage(15, 20)).toBe(75);
    expect(calculateAttendancePercentage(0, 10)).toBe(0);
    expect(calculateAttendancePercentage(5, 0)).toBeNull();
  });

  test('calculateSafeLeaves formula: floor((A / P) - T)', () => {
    // A = 16, T = 20, P = 0.75 => floor(16 / 0.75 - 20) = floor(21.33 - 20) = 1
    expect(calculateSafeLeaves(16, 20, 75)).toBe(1);

    // A = 15, T = 20, P = 0.75 => floor(15 / 0.75 - 20) = floor(20 - 20) = 0
    expect(calculateSafeLeaves(15, 20, 75)).toBe(0);
  });

  test('calculateRecoveryClasses formula: ceil((P * T - A) / (1 - P))', () => {
    // A = 12, T = 20, P = 0.75 => required = 15 => ceil((15 - 12) / 0.25) = 12
    expect(calculateRecoveryClasses(12, 20, 75)).toBe(12);

    // If student is already at/above threshold, return 0
    expect(calculateRecoveryClasses(15, 20, 75)).toBe(0);
  });

  test('calculateScenarioForecast computes future attendance projections', () => {
    // A = 15, T = 20 => 75%. Attend next 3 => A=18, T=23 => 18/23 = 78.26%
    expect(calculateScenarioForecast(15, 20, 3, 0)).toBe(78.26);

    // Miss next 2 => A=15, T=22 => 15/22 = 68.18%
    expect(calculateScenarioForecast(15, 20, 0, 2)).toBe(68.18);
  });

  test('calculateStreaks calculates consecutive attendance and absence streaks', () => {
    const records = [
      { status: 'present', markedAt: '2026-07-01' },
      { status: 'present', markedAt: '2026-07-02' },
      { status: 'late', markedAt: '2026-07-03' },
      { status: 'absent', markedAt: '2026-07-04' },
      { status: 'present', markedAt: '2026-07-05' },
      { status: 'present', markedAt: '2026-07-06' },
    ];

    const streaks = calculateStreaks(records);
    expect(streaks.longestAttendanceStreak).toBe(3); // 2 present + 1 late
    expect(streaks.currentAttendanceStreak).toBe(2); // last 2 present
    expect(streaks.longestAbsenceStreak).toBe(1);
  });

  test('determineHealthStatus correctly labels health status based on buffer', () => {
    expect(determineHealthStatus(82, 75)).toBe('on_track');
    expect(determineHealthStatus(77, 75)).toBe('near_threshold');
    expect(determineHealthStatus(72, 75)).toBe('at_risk');
    expect(determineHealthStatus(60, 75, 0, 15)).toBe('critical');
    expect(determineHealthStatus(null, 75)).toBe('no_data');
  });
});
