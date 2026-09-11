import { AttendanceSession } from './attendanceSession.model.js';
import { AttendanceRecord } from './attendanceRecord.model.js';
import { AttendanceAttempt } from './attendanceAttempt.model.js';
import { Enrollment } from '../enrollments/enrollment.model.js';
import { Classroom } from '../classrooms/classroom.model.js';
import { RECORD_STATUS, DECISION, SUSPICION_LEVELS } from './attendance.constants.js';

export class AttendanceAnalyticsService {
  /**
   * Recalculate and update denormalized statistics for a session.
   */
  static async recalculateSessionStats(sessionId) {
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return null;

    const [records, totalAttempts, suspiciousCount] = await Promise.all([
      AttendanceRecord.find({ sessionId }).lean(),
      AttendanceAttempt.countDocuments({ sessionId }),
      AttendanceAttempt.countDocuments({
        sessionId,
        suspicionLevel: { $in: [SUSPICION_LEVELS.HIGH, SUSPICION_LEVELS.CRITICAL] },
      }),
    ]);

    let accepted = 0;
    let rejected = 0;
    let pendingReview = 0;
    let late = 0;
    let absent = 0;

    for (const record of records) {
      if (record.decision === DECISION.ACCEPTED) accepted++;
      if (record.decision === DECISION.REJECTED) rejected++;
      if (record.decision === DECISION.PENDING_REVIEW) pendingReview++;

      if (record.status === RECORD_STATUS.LATE) late++;
      if (record.status === RECORD_STATUS.ABSENT) absent++;
    }

    session.stats = {
      totalEnrolled: session.stats?.totalEnrolled || 0,
      accepted,
      rejected,
      pendingReview,
      late,
      absent,
      suspicious: suspiciousCount,
      attempts: totalAttempts,
    };

    await session.save();
    return session.stats;
  }

  /**
   * Calculate student health, safe leave, recovery, and forecast for one classroom.
   */
  static async getStudentClassHealth(studentId, classroomId) {
    const classroom = await Classroom.findById(classroomId).lean();
    if (!classroom) return null;

    const thresholdPercent = classroom.attendanceThreshold || 75;
    const P = thresholdPercent / 100;

    const records = await AttendanceRecord.find({ classroomId, studentId, decision: DECISION.ACCEPTED }).lean();
    const T = await AttendanceSession.countDocuments({ classroomId, status: { $in: ['ended', 'expired'] } });

    let A = 0;
    let presentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let absentCount = 0;

    for (const r of records) {
      if (r.status === RECORD_STATUS.PRESENT) {
        A++;
        presentCount++;
      } else if (r.status === RECORD_STATUS.LATE) {
        A++;
        lateCount++;
      } else if (r.status === RECORD_STATUS.EXCUSED) {
        A++;
        excusedCount++;
      } else if (r.status === RECORD_STATUS.ABSENT) {
        absentCount++;
      }
    }

    const currentPercentage = T > 0 ? Math.round((A / T) * 10000) / 100 : 100;

    // Safe Leaves = floor((A / P) - T)
    const safeLeaves = P > 0 ? Math.max(0, Math.floor(A / P - T)) : 999;

    // Recovery Classes = ceil((P * T - A) / (1 - P))
    const recoveryClasses = P < 1 && P * T > A ? Math.max(0, Math.ceil((P * T - A) / (1 - P))) : 0;

    let healthStatus = 'on_track';
    if (currentPercentage < thresholdPercent - 5) healthStatus = 'at_risk';
    else if (currentPercentage < thresholdPercent) healthStatus = 'needs_attention';

    return {
      classroomId: classroom._id,
      classroomName: classroom.name,
      subjectName: classroom.subjectName,
      courseCode: classroom.courseCode,
      attendanceThreshold: thresholdPercent,
      totalConducted: T,
      totalAttended: A,
      presentCount,
      lateCount,
      excusedCount,
      absentCount,
      currentPercentage,
      safeLeaves,
      recoveryClasses,
      healthStatus,
    };
  }

  /**
   * Aggregate student attendance health across all active enrollments.
   */
  static async getStudentOverallHealth(studentId) {
    const enrollments = await Enrollment.find({ studentId, status: 'active' }).lean();
    const classroomIds = enrollments.map((e) => e.classroomId);

    const classHealthList = [];
    let grandTotalT = 0;
    let grandTotalA = 0;

    for (const cid of classroomIds) {
      const health = await this.getStudentClassHealth(studentId, cid);
      if (health) {
        classHealthList.push(health);
        grandTotalT += health.totalConducted;
        grandTotalA += health.totalAttended;
      }
    }

    const overallPercentage = grandTotalT > 0 ? Math.round((grandTotalA / grandTotalT) * 10000) / 100 : 100;

    return {
      overallPercentage,
      totalClassesEnrolled: enrollments.length,
      totalConductedAll: grandTotalT,
      totalAttendedAll: grandTotalA,
      classrooms: classHealthList,
    };
  }

  /**
   * Forecast attendance percentage for different scenarios.
   */
  static async getAttendanceForecast(studentId, classroomId) {
    const health = await this.getStudentClassHealth(studentId, classroomId);
    if (!health) return null;

    const A = health.totalAttended;
    const T = health.totalConducted;

    const forecastScenario = (addAttended, addTotal) => {
      const newT = T + addTotal;
      const newA = A + addAttended;
      return newT > 0 ? Math.round((newA / newT) * 10000) / 100 : 100;
    };

    return {
      currentPercentage: health.currentPercentage,
      scenarios: {
        attendNext1: forecastScenario(1, 1),
        attendNext3: forecastScenario(3, 3),
        attendNext5: forecastScenario(5, 5),
        missNext1: forecastScenario(0, 1),
        missNext2: forecastScenario(0, 2),
      },
    };
  }
}
