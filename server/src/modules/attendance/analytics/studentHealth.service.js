import { AttendanceRecord } from '../attendanceRecord.model.js';
import { AttendanceSession } from '../attendanceSession.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import {
  calculateAttendedEquivalent,
  calculateAttendancePercentage,
  calculateSafeLeaves,
  calculateRecoveryClasses,
  calculateStreaks,
  determineHealthStatus,
  calculateScenarioForecast,
} from './attendanceAnalytics.utils.js';

export class StudentHealthService {
  /**
   * Get complete student health metrics for a single classroom.
   */
  static async getStudentClassHealth(studentId, classroomId) {
    const classroom = await Classroom.findById(classroomId).lean();
    if (!classroom) return null;

    const thresholdPercent = classroom.attendanceThreshold || 75;

    const [records, conductedSessions] = await Promise.all([
      AttendanceRecord.find({ classroomId, studentId }).lean(),
      AttendanceSession.countDocuments({ classroomId, status: { $in: ['ended', 'expired'] } }),
    ]);

    const attendedEquivalent = calculateAttendedEquivalent(records);
    const attendancePercentage = calculateAttendancePercentage(attendedEquivalent, conductedSessions);

    const safeLeaves = calculateSafeLeaves(attendedEquivalent, conductedSessions, thresholdPercent);
    const recoveryClasses = calculateRecoveryClasses(attendedEquivalent, conductedSessions, thresholdPercent);
    const healthStatus = determineHealthStatus(attendancePercentage, thresholdPercent, safeLeaves, recoveryClasses);
    const streaks = calculateStreaks(records);

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let excusedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    for (const r of records) {
      if (r.status === 'present') presentCount++;
      else if (r.status === 'late') lateCount++;
      else if (r.status === 'absent') absentCount++;
      else if (r.status === 'excused') excusedCount++;
      else if (r.status === 'pending_review') pendingCount++;
      else if (r.status === 'rejected') rejectedCount++;
    }

    const gap = attendancePercentage !== null ? Math.round((attendancePercentage - thresholdPercent) * 100) / 100 : 0;

    return {
      classroomId: classroom._id,
      classroomName: classroom.name,
      subjectName: classroom.subjectName,
      courseCode: classroom.courseCode,
      attendanceThreshold: thresholdPercent,
      totalConducted: conductedSessions,
      attendedEquivalent,
      attendancePercentage,
      gap,
      healthStatus,
      safeLeaves,
      recoveryClasses,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      pendingCount,
      rejectedCount,
      streaks,
      scenarios: {
        attendNext1: calculateScenarioForecast(attendedEquivalent, conductedSessions, 1, 0),
        attendNext3: calculateScenarioForecast(attendedEquivalent, conductedSessions, 3, 0),
        attendNext5: calculateScenarioForecast(attendedEquivalent, conductedSessions, 5, 0),
        missNext1: calculateScenarioForecast(attendedEquivalent, conductedSessions, 0, 1),
        missNext2: calculateScenarioForecast(attendedEquivalent, conductedSessions, 0, 2),
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Aggregate student health across all active enrolled classrooms.
   */
  static async getStudentOverallHealth(studentId) {
    const enrollments = await Enrollment.find({ studentId, status: 'active' }).lean();
    const classroomIds = enrollments.map((e) => e.classroomId);

    const classHealthList = [];
    let grandTotalConducted = 0;
    let grandTotalAttendedEq = 0;

    for (const cid of classroomIds) {
      const h = await this.getStudentClassHealth(studentId, cid);
      if (h) {
        classHealthList.push(h);
        grandTotalConducted += h.totalConducted;
        grandTotalAttendedEq += h.attendedEquivalent;
      }
    }

    const overallPercentage = calculateAttendancePercentage(grandTotalAttendedEq, grandTotalConducted);

    return {
      overallPercentage,
      totalClassesEnrolled: enrollments.length,
      totalConductedAll: grandTotalConducted,
      totalAttendedAll: grandTotalAttendedEq,
      classrooms: classHealthList,
      lastUpdated: new Date().toISOString(),
    };
  }
}
