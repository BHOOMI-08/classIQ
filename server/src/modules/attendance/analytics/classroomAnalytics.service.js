import { AttendanceRecord } from '../attendanceRecord.model.js';
import { AttendanceSession } from '../attendanceSession.model.js';
import { AttendanceAttempt } from '../attendanceAttempt.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { AttendanceAggregationBuilder } from './attendanceAggregation.builder.js';
import { calculateAttendancePercentage, determineHealthStatus } from './attendanceAnalytics.utils.js';

export class ClassroomAnalyticsService {
  /**
   * Classroom overview metrics.
   */
  static async getClassroomOverview(classroomId, filters = {}) {
    const classroom = await Classroom.findById(classroomId).lean();
    if (!classroom) return null;

    const thresholdPercent = classroom.attendanceThreshold || 75;

    const [sessions, totalEnrolled, records, attempts] = await Promise.all([
      AttendanceSession.find({ classroomId, status: { $in: ['ended', 'expired'] } }).lean(),
      Enrollment.countDocuments({ classroomId, status: 'active' }),
      AttendanceRecord.find({ classroomId }).lean(),
      AttendanceAttempt.find({ classroomId }).lean(),
    ]);

    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;
    let pendingReview = 0;
    let rejected = 0;

    for (const r of records) {
      if (r.status === 'present') present++;
      else if (r.status === 'late') late++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'excused') excused++;
      else if (r.status === 'pending_review') pendingReview++;
      else if (r.status === 'rejected') rejected++;
    }

    const totalRecords = records.length;
    const attendedEq = present + late + excused;
    const averageAttendancePct = calculateAttendancePercentage(attendedEq, totalRecords);

    // Calculate student threshold distribution
    const studentRecordsMap = {};
    for (const r of records) {
      const sid = r.studentId.toString();
      if (!studentRecordsMap[sid]) studentRecordsMap[sid] = [];
      studentRecordsMap[sid].push(r);
    }

    let onTrackCount = 0;
    let nearThresholdCount = 0;
    let atRiskCount = 0;

    const studentIds = Object.keys(studentRecordsMap);
    for (const sid of studentIds) {
      const sRecords = studentRecordsMap[sid];
      let sAtt = 0;
      for (const sr of sRecords) {
        if (['present', 'late', 'excused'].includes(sr.status)) sAtt++;
      }
      const sPct = calculateAttendancePercentage(sAtt, sessions.length) ?? 100;
      const status = determineHealthStatus(sPct, thresholdPercent);
      if (status === 'on_track') onTrackCount++;
      else if (status === 'near_threshold') nearThresholdCount++;
      else atRiskCount++;
    }

    const lateArrivalRate = totalRecords > 0 ? Math.round((late / totalRecords) * 10000) / 100 : 0;
    const flaggedAttemptsCount = attempts.filter((a) => a.suspicionLevel === 'high' || a.suspicionLevel === 'critical').length;

    return {
      classroomId: classroom._id,
      classroomName: classroom.name,
      subjectName: classroom.subjectName,
      attendanceThreshold: thresholdPercent,
      totalSessionsConducted: sessions.length,
      totalEnrolledStudents: totalEnrolled,
      averageAttendancePct,
      lateArrivalRate,
      statusCounts: {
        present,
        late,
        absent,
        excused,
        pendingReview,
        rejected,
        totalRecords,
      },
      studentDistribution: {
        onTrack: onTrackCount,
        nearThreshold: nearThresholdCount,
        atRisk: atRiskCount,
      },
      securitySummary: {
        totalAttempts: attempts.length,
        flaggedAttempts: flaggedAttemptsCount,
      },
    };
  }

  /**
   * Classroom attendance trend analytics.
   */
  static async getClassroomTrends(classroomId, { startDate, endDate, groupBy = 'day' } = {}) {
    const pipeline = AttendanceAggregationBuilder.buildTrendPipeline(classroomId, { startDate, endDate, groupBy });
    const result = await AttendanceRecord.aggregate(pipeline);

    return result.map((item) => {
      const attended = item.present + item.late + item.excused;
      const pct = calculateAttendancePercentage(attended, item.totalRecords);
      return {
        ...item,
        attendedEquivalent: attended,
        attendancePercentage: pct,
      };
    });
  }

  /**
   * Session analytics comparison list.
   */
  static async getSessionAnalyticsList(classroomId, { page = 1, limit = 20 } = {}) {
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const [sessions, totalSessions] = await Promise.all([
      AttendanceSession.find({ classroomId })
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AttendanceSession.countDocuments({ classroomId }),
    ]);

    return {
      items: sessions.map((s) => ({
        sessionId: s._id,
        title: s.title,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        durationMinutes: s.durationMinutes,
        stats: s.stats || {},
      })),
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        totalItems: totalSessions,
        totalPages: Math.ceil(totalSessions / limitNum) || 1,
      },
    };
  }
}
