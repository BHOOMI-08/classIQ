import { AttendanceRecord } from '../attendanceRecord.model.js';
import { AttendanceAttempt } from '../attendanceAttempt.model.js';
import { AttendanceCorrection } from '../attendanceCorrection.model.js';
import { StudentProfile } from '../../profiles/student-profile.model.js';
import { User } from '../../users/user.model.js';
import { StudentHealthService } from './studentHealth.service.js';

export class StudentInsightService {
  /**
   * Teacher deep-dive into an individual student's attendance metrics.
   */
  static async getStudentInsight(classroomId, studentId) {
    const [user, profile, health, records, attempts, corrections] = await Promise.all([
      User.findById(studentId).select('name email').lean(),
      StudentProfile.findOne({ userId: studentId }).lean(),
      StudentHealthService.getStudentClassHealth(studentId, classroomId),
      AttendanceRecord.find({ classroomId, studentId }).sort({ markedAt: -1 }).lean(),
      AttendanceAttempt.find({ classroomId, studentId }).sort({ createdAt: -1 }).lean(),
      AttendanceCorrection.find({ classroomId, studentId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!user) return null;

    return {
      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: profile?.rollNumber || '',
        department: profile?.department || '',
        semester: profile?.semester || '',
        section: profile?.section || '',
      },
      health,
      timeline: records.map((r) => ({
        recordId: r._id,
        sessionId: r.sessionId,
        status: r.status,
        decision: r.decision,
        markedAt: r.markedAt,
        lateByMinutes: r.lateByMinutes,
        suspicionLevel: r.suspicionLevel,
      })),
      attemptsCount: attempts.length,
      correctionsCount: corrections.length,
      corrections,
    };
  }
}
