import { AttendanceAttempt } from '../attendanceAttempt.model.js';
import { AttendanceAggregationBuilder } from './attendanceAggregation.builder.js';

export class AttendanceSecurityAnalyticsService {
  /**
   * Teacher-only security analytics.
   */
  static async getSecurityAnalytics(classroomId, { startDate, endDate } = {}) {
    const pipeline = AttendanceAggregationBuilder.buildSecurityAttemptPipeline(classroomId, { startDate, endDate });
    const [stats] = await AttendanceAttempt.aggregate(pipeline);

    const total = stats?.totalAttempts || 0;
    const accepted = stats?.acceptedAttempts || 0;
    const rejected = stats?.rejectedAttempts || 0;
    const flagged = stats?.flaggedAttempts || 0;
    const critical = stats?.criticalAttempts || 0;

    const rejectionRate = total > 0 ? Math.round((rejected / total) * 10000) / 100 : 0;
    const flagRate = total > 0 ? Math.round((flagged / total) * 10000) / 100 : 0;

    // Fetch recent flagged attempts for security table
    const flaggedAttemptsList = await AttendanceAttempt.find({
      classroomId,
      suspicionLevel: { $in: ['high', 'critical'] },
    })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    return {
      totalAttempts: total,
      acceptedAttempts: accepted,
      rejectedAttempts: rejected,
      flaggedAttempts: flagged,
      criticalAttempts: critical,
      rejectionRate,
      flagRate,
      flaggedAttemptsList: flaggedAttemptsList.map((a) => ({
        attemptId: a._id,
        student: a.studentId,
        result: a.result,
        suspicionLevel: a.suspicionLevel,
        suspicionScore: a.suspicionScore,
        suspicionSignals: a.suspicionSignals || [],
        createdAt: a.createdAt,
      })),
    };
  }
}
