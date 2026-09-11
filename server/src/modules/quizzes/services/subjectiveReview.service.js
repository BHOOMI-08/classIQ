import { QuestionScore } from '../models/questionScore.model.js';
import { QuizResult } from '../models/quizResult.model.js';
import { QuizAnswer } from '../models/quizAnswer.model.js';
import { ApiError } from '../../../utils/api-error.js';
import { clamp, getGradeLabel } from '../utils/grading.utils.js';
import { RESULT_STATUS } from '../utils/quiz.constants.js';

export class SubjectiveReviewService {
  /**
   * Get all pending review items for a quiz.
   */
  static async getPendingReviewItems(quizId) {
    const results = await QuizResult.find({ quizId, status: { $in: [RESULT_STATUS.MANUAL_REVIEW_REQUIRED, RESULT_STATUS.AUTO_GRADED] } })
      .populate('studentId', 'name email')
      .lean();

    const reviewItems = [];
    for (const result of results) {
      const pendingScores = await QuestionScore.find({ resultId: result._id, correctness: 'pending_review' })
        .populate('attemptQuestionId')
        .lean();

      const answers = await QuizAnswer.find({
        attemptId: result.attemptId,
        attemptQuestionId: { $in: pendingScores.map((s) => s.attemptQuestionId) },
      }).lean();

      const answerByQuestionId = {};
      for (const a of answers) answerByQuestionId[a.attemptQuestionId.toString()] = a;

      reviewItems.push({
        result,
        pendingScores: pendingScores.map((s) => ({
          ...s,
          studentAnswer: answerByQuestionId[s.attemptQuestionId?.toString()],
        })),
      });
    }

    return reviewItems;
  }

  /**
   * Save teacher mark for a specific question score.
   */
  static async reviewQuestion({ questionScoreId, reviewerId, marksAwarded, reviewerFeedback }) {
    const score = await QuestionScore.findById(questionScoreId);
    if (!score) throw ApiError.notFound('Question score not found');

    if (!['pending_review', 'manual'].includes(score.gradingMode === 'automatic' ? 'skip' : score.correctness)) {
      if (score.correctness !== 'pending_review') throw ApiError.conflict('This question has already been reviewed');
    }

    const safeMarks = clamp(marksAwarded, 0, score.marksAvailable);
    score.marksAwarded = safeMarks;
    score.reviewerId = reviewerId;
    score.reviewerFeedback = reviewerFeedback || '';
    score.reviewedAt = new Date();
    score.gradingMode = 'manual';
    score.correctness = safeMarks >= score.marksAvailable ? 'correct'
      : safeMarks > 0 ? 'partially_correct'
      : 'incorrect';
    await score.save();

    return score;
  }

  /**
   * Finalize result after all manual reviews are complete.
   */
  static async finalizeResult(resultId, releasedBy) {
    const result = await QuizResult.findById(resultId);
    if (!result) throw ApiError.notFound('Result not found');

    const pendingCount = await QuestionScore.countDocuments({ resultId, correctness: 'pending_review' });
    if (pendingCount > 0) {
      throw ApiError.conflict(`${pendingCount} questions still require manual review`);
    }

    // Aggregate final marks from all question scores
    const allScores = await QuestionScore.find({ resultId }).lean();
    const subjectiveMarks = allScores.filter((s) => s.gradingMode === 'manual').reduce((sum, s) => sum + s.marksAwarded, 0);
    const objectiveMarks = allScores.filter((s) => s.gradingMode !== 'manual').reduce((sum, s) => sum + s.marksAwarded, 0);
    const negativeMarks = allScores.reduce((sum, s) => sum + (s.negativeMarksApplied || 0), 0);

    const finalMarks = clamp(objectiveMarks + subjectiveMarks - negativeMarks, 0, result.totalMarks);
    result.subjectiveMarks = subjectiveMarks;
    result.objectiveMarks = objectiveMarks;
    result.negativeMarks = negativeMarks;
    result.finalMarks = finalMarks;
    result.percentage = result.totalMarks > 0 ? Number(((finalMarks / result.totalMarks) * 100).toFixed(2)) : 0;
    result.gradeLabel = getGradeLabel(result.percentage);
    result.status = RESULT_STATUS.FINALIZED;
    result.releasedBy = releasedBy;
    await result.save();

    return result;
  }
}
