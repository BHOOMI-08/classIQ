import mongoose from 'mongoose';

export class AttendanceAggregationBuilder {
  /**
   * Build match filter for Date ranges.
   */
  static buildDateFilter(field = 'createdAt', { startDate, endDate }) {
    const filter = {};
    if (startDate || endDate) {
      filter[field] = {};
      if (startDate) filter[field].$gte = new Date(startDate);
      if (endDate) filter[field].$lte = new Date(endDate);
    }
    return filter;
  }

  /**
   * Pipeline for status distribution count in a classroom.
   */
  static buildStatusDistributionPipeline(classroomId, { startDate, endDate }) {
    const match = {
      classroomId: new mongoose.Types.ObjectId(classroomId),
      ...this.buildDateFilter('markedAt', { startDate, endDate }),
    };

    return [
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ];
  }

  /**
   * Pipeline for classroom attendance trends grouped by day/week/month.
   */
  static buildTrendPipeline(classroomId, { startDate, endDate, groupBy = 'day' }) {
    const match = {
      classroomId: new mongoose.Types.ObjectId(classroomId),
      ...this.buildDateFilter('markedAt', { startDate, endDate }),
    };

    let dateGroup = {
      year: { $year: '$markedAt' },
      month: { $month: '$markedAt' },
      day: { $dayOfMonth: '$markedAt' },
    };

    if (groupBy === 'week') {
      dateGroup = {
        isoYear: { $isoWeekYear: '$markedAt' },
        isoWeek: { $isoWeek: '$markedAt' },
      };
    } else if (groupBy === 'month') {
      dateGroup = {
        year: { $year: '$markedAt' },
        month: { $month: '$markedAt' },
      };
    }

    return [
      { $match: match },
      {
        $group: {
          _id: dateGroup,
          periodStart: { $min: '$markedAt' },
          periodEnd: { $max: '$markedAt' },
          totalRecords: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
          pendingReview: { $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] } },
        },
      },
      { $sort: { periodStart: 1 } },
    ];
  }

  /**
   * Pipeline for weekday attendance analysis.
   */
  static buildWeekdayPipeline(classroomId) {
    return [
      { $match: { classroomId: new mongoose.Types.ObjectId(classroomId) } },
      {
        $group: {
          _id: { $dayOfWeek: '$markedAt' },
          totalRecords: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ];
  }

  /**
   * Pipeline for security attempt statistics.
   */
  static buildSecurityAttemptPipeline(classroomId, { startDate, endDate }) {
    const match = {
      classroomId: new mongoose.Types.ObjectId(classroomId),
      ...this.buildDateFilter('createdAt', { startDate, endDate }),
    };

    return [
      { $match: match },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          acceptedAttempts: { $sum: { $cond: [{ $eq: ['$result', 'accepted'] }, 1, 0] } },
          rejectedAttempts: { $sum: { $cond: [{ $eq: ['$result', 'rejected'] }, 1, 0] } },
          flaggedAttempts: { $sum: { $cond: [{ $eq: ['$suspicionLevel', 'high'] }, 1, 0] } },
          criticalAttempts: { $sum: { $cond: [{ $eq: ['$suspicionLevel', 'critical'] }, 1, 0] } },
        },
      },
    ];
  }
}
