import { QuizResult } from '../models/quizResult.model.js';
import { QuizAttempt } from '../models/quizAttempt.model.js';
import { QuestionScore } from '../models/questionScore.model.js';
import { Quiz } from '../models/quiz.model.js';
import { ObjectiveGradingService } from './objectiveGrading.service.js';
import { TopicPerformanceService } from './topicPerformance.service.js';
import { clamp, getGradeLabel } from '../utils/grading.utils.js';
import { RESULT_STATUS } from '../utils/quiz.constants.js';
import { logger } from '../../../utils/logger.js';

export class ResultCalculationService {
  static async calculateResult(attemptId) {
    const attempt = await QuizAttempt.findById(attemptId).lean();
    if (!attempt) throw new Error(`Attempt ${attemptId} not found`);

    const quiz = await Quiz.findById(attempt.quizId).lean();
    if (!quiz) throw new Error(`Quiz not found`);

    // Create or update QuizResult record
    let result = await QuizResult.findOne({ attemptId });
    if (!result) {
      result = await QuizResult.create({
        quizId: attempt.quizId,
        attemptId,
        classroomId: attempt.classroomId,
        studentId: attempt.studentId,
        totalMarks: quiz.totalMarks,
        status: RESULT_STATUS.PENDING,
      });
    }

    // Auto-grade objective questions
    const { objectiveMarks, negativeMarks, correctCount, incorrectCount, unansweredCount, manualReviewCount } =
      await ObjectiveGradingService.gradeObjectiveQuestions(attemptId, result._id, quiz);

    const timeTakenSeconds = attempt.submittedAt
      ? Math.floor((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 1000)
      : attempt.durationSeconds;

    const requiresManualReview = manualReviewCount > 0;

    result.objectiveMarks = objectiveMarks;
    result.negativeMarks = negativeMarks;
    result.correctCount = correctCount;
    result.incorrectCount = incorrectCount;
    result.unansweredCount = unansweredCount;
    result.manualReviewRequiredCount = manualReviewCount;
    result.timeTakenSeconds = timeTakenSeconds;

    if (!requiresManualReview) {
      const finalMarks = clamp(objectiveMarks - negativeMarks, 0, quiz.totalMarks);
      result.finalMarks = finalMarks;
      result.percentage = quiz.totalMarks > 0 ? Number(((finalMarks / quiz.totalMarks) * 100).toFixed(2)) : 0;
      result.gradeLabel = getGradeLabel(result.percentage);
      result.passed = finalMarks >= (quiz.passingMarks || 0);
      result.status = RESULT_STATUS.AUTO_GRADED;
    } else {
      result.status = RESULT_STATUS.MANUAL_REVIEW_REQUIRED;
    }

    await result.save();

    // Update attempt status
    await QuizAttempt.updateOne({ _id: attemptId }, { $set: { status: 'graded', resultId: result._id } });

    // Generate topic performance
    await TopicPerformanceService.generateTopicPerformance(result._id, attemptId, attempt.quizId, attempt.studentId, attempt.classroomId);

    // Release if policy is immediate and no manual review needed
    if (!requiresManualReview && quiz.resultReleaseMode === 'immediate') {
      result.status = RESULT_STATUS.RELEASED;
      result.releasedAt = new Date();
      await result.save();

      // Update quiz stats
      await Quiz.updateOne({ _id: quiz._id }, {
        $inc: { completedAttempts: 1 },
        $max: { highestScore: result.finalMarks },
      });
    }

    logger.info(`📊 Result calculated for attempt ${attemptId}: ${result.finalMarks}/${quiz.totalMarks} (${result.percentage}%)`);
    return result;
  }
}
