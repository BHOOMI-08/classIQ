import { Submission } from '../models/submission.model.js';
import { Grade } from '../models/grade.model.js';
import { User } from '../../users/user.model.js';
import { Assignment } from '../models/assignment.model.js';

export class AssignmentExportService {
  static async exportCSV(assignmentId) {
    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) return '';

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email rollNumber')
      .populate('finalGradeId')
      .lean();

    const headers = [
      'Student Name',
      'Email',
      'Roll Number',
      'Submission Status',
      'Submitted At',
      'Is Late',
      'Late Penalty Marks',
      'Raw Marks',
      'Final Marks',
      'Total Marks',
      'Percentage',
      'Grade Label',
      'Receipt Code',
    ];

    const rows = submissions.map((sub) => {
      const student = sub.studentId || {};
      const grade = sub.finalGradeId || {};

      return [
        `"${student.name || 'Unknown'}"`,
        `"${student.email || ''}"`,
        `"${student.rollNumber || ''}"`,
        sub.status,
        sub.submittedAt ? new Date(sub.submittedAt).toISOString() : 'N/A',
        sub.isLate ? 'YES' : 'NO',
        grade.latePenaltyMarks || 0,
        grade.rawMarks || 0,
        grade.finalMarks || 0,
        assignment.totalMarks,
        grade.percentage ? `${grade.percentage}%` : 'N/A',
        grade.gradeLabel || 'N/A',
        `"${sub.receiptCode || ''}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
