import { Assignment } from '../models/assignment.model.js';
import { Submission } from '../models/submission.model.js';
import { Grade } from '../models/grade.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';

export class AssignmentAnalyticsService {
  static async getAssignmentAnalytics(assignmentId) {
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) return null;

    const totalEnrolled = await Enrollment.countDocuments({
      classroomId: assignment.classroomId,
      status: 'active',
    });

    const submissions = await Submission.find({ assignmentId }).lean();
    const grades = await Grade.find({ assignmentId, isPublished: true }).lean();

    const submittedCount = submissions.filter((s) => s.status !== 'draft' && s.status !== 'missing').length;
    const lateCount = submissions.filter((s) => s.isLate).length;
    const missingCount = submissions.filter((s) => s.status === 'missing').length;
    const gradedCount = grades.length;

    let averageMarks = 0;
    let highestMarks = 0;
    let lowestMarks = assignment.totalMarks;
    let passCount = 0;

    if (grades.length > 0) {
      const totalScore = grades.reduce((acc, g) => acc + g.finalMarks, 0);
      averageMarks = Number((totalScore / grades.length).toFixed(2));
      highestMarks = Math.max(...grades.map((g) => g.finalMarks));
      lowestMarks = Math.min(...grades.map((g) => g.finalMarks));
      passCount = grades.filter((g) => g.finalMarks >= assignment.passingMarks).length;
    } else {
      lowestMarks = 0;
    }

    const passRate = gradedCount > 0 ? Number(((passCount / gradedCount) * 100).toFixed(2)) : 0;
    const submissionRate = totalEnrolled > 0 ? Number(((submittedCount / totalEnrolled) * 100).toFixed(2)) : 0;

    return {
      assignment,
      totalEnrolled,
      submittedCount,
      lateCount,
      missingCount,
      gradedCount,
      averageMarks,
      highestMarks,
      lowestMarks,
      passCount,
      passRate,
      submissionRate,
    };
  }
}
