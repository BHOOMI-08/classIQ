import { Grade } from '../models/grade.model.js';
import { GradeCriterion } from '../models/gradeCriterion.model.js';
import { Submission } from '../models/submission.model.js';
import { Assignment } from '../models/assignment.model.js';
import { Rubric } from '../models/rubric.model.js';
import { RubricCriterion } from '../models/rubricCriterion.model.js';
import { LatePolicyService } from './latePolicy.service.js';
import { ApiError } from '../../../utils/api-error.js';

export class GradingService {
  /**
   * Calculate Grade Label from percentage.
   */
  static getGradeLabel(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  /**
   * Grade a student submission.
   */
  static async gradeSubmission({
    submissionId,
    teacherId,
    rawMarks,
    rubricCriteriaMarks,
    adjustmentMarks = 0,
    overallFeedback,
    internalNote,
    isPublished = false,
  }) {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw ApiError.notFound('Submission not found');

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) throw ApiError.notFound('Assignment not found');

    let computedRawMarks = Number(rawMarks) || 0;
    let rubricMarksTotal = 0;
    const createdCriteria = [];

    // Calculate Rubric Criteria Scores if provided
    if (Array.isArray(rubricCriteriaMarks) && rubricCriteriaMarks.length > 0) {
      for (const item of rubricCriteriaMarks) {
        const criterion = await RubricCriterion.findById(item.criterionId);
        if (!criterion) continue;

        const awarded = Math.min(criterion.maximumMarks, Math.max(0, Number(item.awardedMarks) || 0));
        rubricMarksTotal += awarded;

        createdCriteria.push({
          rubricId: criterion.rubricId,
          criterionId: criterion._id,
          criterionTitleSnapshot: criterion.title,
          maximumMarksSnapshot: criterion.maximumMarks,
          awardedMarks: awarded,
          feedback: item.feedback || '',
          selectedLevel: item.selectedLevel || {},
        });
      }
      computedRawMarks = rubricMarksTotal;
    }

    // Server-Authoritative Late Penalty Calculation
    const latePenaltyInfo = LatePolicyService.calculatePenalty({
      totalMarks: assignment.totalMarks,
      rawMarks: computedRawMarks,
      lateByMinutes: submission.lateByMinutes,
      latePolicy: assignment.latePolicy,
      allowLateSubmission: assignment.allowLateSubmission,
    });

    const latePenaltyMarks = latePenaltyInfo.penaltyMarks || 0;

    // Final Marks Calculation: rawMarks + adjustmentMarks - latePenaltyMarks
    let finalMarks = computedRawMarks + (Number(adjustmentMarks) || 0) - latePenaltyMarks;
    finalMarks = Math.min(assignment.totalMarks, Math.max(0, Number(finalMarks.toFixed(2))));

    const percentage = Number(((finalMarks / assignment.totalMarks) * 100).toFixed(2));
    const gradeLabel = this.getGradeLabel(percentage);

    const grade = await Grade.create({
      assignmentId: assignment._id,
      submissionId: submission._id,
      submissionVersionId: submission.currentVersionId,
      classroomId: assignment.classroomId,
      studentId: submission.studentId,
      gradedBy: teacherId,
      rawMarks: computedRawMarks,
      rubricMarks: rubricMarksTotal,
      adjustmentMarks: Number(adjustmentMarks) || 0,
      latePenaltyMarks,
      finalMarks,
      percentage,
      gradeLabel,
      status: isPublished ? 'published' : 'finalized',
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      returnedAt: isPublished ? new Date() : null,
      overallFeedback: overallFeedback || '',
      internalNote: internalNote || '',
    });

    // Save Criterion Snapshots
    for (const c of createdCriteria) {
      await GradeCriterion.create({
        gradeId: grade._id,
        ...c,
      });
    }

    // Update Submission Record
    submission.finalGradeId = grade._id;
    submission.status = isPublished ? 'returned' : 'graded';
    submission.gradedAt = new Date();
    if (isPublished) submission.returnedAt = new Date();
    await submission.save();

    // Increment assignment graded count
    await Assignment.findByIdAndUpdate(assignment._id, {
      $inc: { gradedSubmissions: 1 },
    });

    return { grade, criteria: createdCriteria };
  }

  /**
   * Return Assignment & Release Grade to Student.
   */
  static async returnSubmission(submissionId, teacherId) {
    const submission = await Submission.findById(submissionId);
    if (!submission || !submission.finalGradeId) {
      throw ApiError.notFound('Submission or grade not found');
    }

    const grade = await Grade.findById(submission.finalGradeId);
    if (!grade) throw ApiError.notFound('Grade record not found');

    grade.isPublished = true;
    grade.status = 'published';
    grade.publishedAt = new Date();
    grade.returnedAt = new Date();
    await grade.save();

    submission.status = 'returned';
    submission.returnedAt = new Date();
    await submission.save();

    return { submission, grade };
  }
}
