import { AttendanceRecord } from './attendanceRecord.model.js';
import { AttendanceSession } from './attendanceSession.model.js';
import { Classroom } from '../classrooms/classroom.model.js';
import { StudentProfile } from '../profiles/student-profile.model.js';
import { ApiError } from '../../utils/api-error.js';

export class AttendanceExportService {
  /**
   * Generate sanitized CSV string for a single session.
   */
  static async exportSessionCsv(sessionId) {
    const session = await AttendanceSession.findById(sessionId).populate('classroomId', 'name courseCode section');
    if (!session) {
      throw ApiError.notFound('Session not found');
    }

    const records = await AttendanceRecord.find({ sessionId })
      .populate('studentId', 'name email')
      .sort({ markedAt: 1 })
      .lean();

    const studentUserIds = records.map((r) => r.studentId?._id).filter(Boolean);
    const studentProfiles = await StudentProfile.find({ userId: { $in: studentUserIds } }).lean();
    const profileMap = {};
    studentProfiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const headers = ['Student Name', 'Email', 'Roll Number', 'Status', 'Decision', 'Marked At', 'Late By (Mins)', 'Mark Source'];
    const rows = records.map((r) => {
      const uid = r.studentId?._id?.toString();
      const profile = profileMap[uid] || {};
      return [
        `"${r.studentId?.name || ''}"`,
        `"${r.studentId?.email || ''}"`,
        `"${profile.rollNumber || ''}"`,
        `"${r.status || ''}"`,
        `"${r.decision || ''}"`,
        `"${r.markedAt ? new Date(r.markedAt).toISOString() : ''}"`,
        r.lateByMinutes || 0,
        `"${r.markSource || ''}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate sanitized CSV for a classroom within optional date ranges.
   */
  static async exportClassroomCsv(classroomId, { startDate, endDate } = {}) {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    const filter = { classroomId };
    if (startDate || endDate) {
      filter.markedAt = {};
      if (startDate) filter.markedAt.$gte = new Date(startDate);
      if (endDate) filter.markedAt.$lte = new Date(endDate);
    }

    const records = await AttendanceRecord.find(filter)
      .populate('studentId', 'name email')
      .populate('sessionId', 'title startedAt')
      .sort({ markedAt: 1 })
      .lean();

    const studentUserIds = records.map((r) => r.studentId?._id).filter(Boolean);
    const studentProfiles = await StudentProfile.find({ userId: { $in: studentUserIds } }).lean();
    const profileMap = {};
    studentProfiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const headers = ['Session Title', 'Session Date', 'Student Name', 'Email', 'Roll Number', 'Status', 'Decision', 'Marked At', 'Late By (Mins)'];
    const rows = records.map((r) => {
      const uid = r.studentId?._id?.toString();
      const profile = profileMap[uid] || {};
      return [
        `"${r.sessionId?.title || ''}"`,
        `"${r.sessionId?.startedAt ? new Date(r.sessionId.startedAt).toISOString().split('T')[0] : ''}"`,
        `"${r.studentId?.name || ''}"`,
        `"${r.studentId?.email || ''}"`,
        `"${profile.rollNumber || ''}"`,
        `"${r.status || ''}"`,
        `"${r.decision || ''}"`,
        `"${r.markedAt ? new Date(r.markedAt).toISOString() : ''}"`,
        r.lateByMinutes || 0,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
