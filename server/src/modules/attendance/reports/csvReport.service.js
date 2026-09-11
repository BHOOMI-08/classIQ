import { AttendanceRecord } from '../attendanceRecord.model.js';
import { AttendanceSession } from '../attendanceSession.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { StudentProfile } from '../../profiles/student-profile.model.js';
import { ApiError } from '../../../utils/api-error.js';

export class CsvReportService {
  /**
   * Sanitize string against CSV formula injection (=, +, -, @).
   */
  static sanitizeCsvCell(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (/^[=+\-@]/.test(str)) {
      str = "'" + str; // Prefix apostrophe to disarm formula execution
    }
    // Escape internal double quotes
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  /**
   * Generate sanitized CSV report for a classroom summary.
   */
  static async generateClassroomCsv(classroomId) {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw ApiError.notFound('Classroom not found');

    const records = await AttendanceRecord.find({ classroomId })
      .populate('studentId', 'name email')
      .populate('sessionId', 'title startedAt')
      .sort({ markedAt: 1 })
      .lean();

    const studentUserIds = records.map((r) => r.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ userId: { $in: studentUserIds } }).lean();
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const headers = [
      'Session Title',
      'Session Date',
      'Student Name',
      'Email',
      'Roll Number',
      'Status',
      'Decision',
      'Marked At',
      'Late By (Mins)',
    ];

    const rows = records.map((r) => {
      const uid = r.studentId?._id?.toString();
      const prof = profileMap[uid] || {};
      return [
        this.sanitizeCsvCell(r.sessionId?.title || ''),
        this.sanitizeCsvCell(r.sessionId?.startedAt ? new Date(r.sessionId.startedAt).toISOString().split('T')[0] : ''),
        this.sanitizeCsvCell(r.studentId?.name || ''),
        this.sanitizeCsvCell(r.studentId?.email || ''),
        this.sanitizeCsvCell(prof.rollNumber || ''),
        this.sanitizeCsvCell(r.status || ''),
        this.sanitizeCsvCell(r.decision || ''),
        this.sanitizeCsvCell(r.markedAt ? new Date(r.markedAt).toISOString() : ''),
        this.sanitizeCsvCell(r.lateByMinutes || 0),
      ].join(',');
    });

    const bom = '\uFEFF'; // UTF-8 BOM
    return bom + [headers.map(h => this.sanitizeCsvCell(h)).join(','), ...rows].join('\n');
  }
}
