import { QuizResult } from '../models/quizResult.model.js';
import { QuestionScore } from '../models/questionScore.model.js';
import { QuizAttempt } from '../models/quizAttempt.model.js';
import { QuizAnalyticsSnapshot } from '../models/quizAnalyticsSnapshot.model.js';
import { QuestionAnalyticsSnapshot } from '../models/questionAnalyticsSnapshot.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { RESULT_STATUS } from '../utils/quiz.constants.js';

export class QuizAnalyticsService {
  static async computeQuizAnalytics(quizId, classroomId) {
    const [eligibleStudents, results] = await Promise.all([
      Enrollment.countDocuments({ classroomId, status: 'active' }),
      QuizResult.find({ quizId }).lean(),
    ]);

    const startedCount = await QuizAttempt.countDocuments({ quizId, status: { $nin: ['created'] } });
    const completedCount = results.filter((r) => [RESULT_STATUS.AUTO_GRADED, RESULT_STATUS.FINALIZED, RESULT_STATUS.RELEASED].includes(r.status)).length;
    const autoSubmitCount = await QuizAttempt.countDocuments({ quizId, status: 'auto_submitted' });

    const releasedResults = results.filter((r) => r.status === RESULT_STATUS.RELEASED);
    const scores = releasedResults.map((r) => r.finalMarks || 0);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const sortedScores = [...scores].sort((a, b) => a - b);
    const medianScore = sortedScores.length > 0 ? sortedScores[Math.floor(sortedScores.length / 2)] : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    const passCount = releasedResults.filter((r) => r.passed).length;
    const passRate = releasedResults.length > 0 ? Number(((passCount / releasedResults.length) * 100).toFixed(2)) : 0;

    const avgTime = releasedResults.length > 0
      ? releasedResults.reduce((sum, r) => sum + (r.timeTakenSeconds || 0), 0) / releasedResults.length
      : 0;

    // Score distribution in buckets of 10%
    const distribution = {};
    for (const r of releasedResults) {
      const bucket = Math.floor((r.percentage || 0) / 10) * 10;
      distribution[`${bucket}-${bucket + 10}`] = (distribution[`${bucket}-${bucket + 10}`] || 0) + 1;
    }

    const snapshot = await QuizAnalyticsSnapshot.findOneAndUpdate(
      { quizId },
      {
        quizId, classroomId, eligibleStudents, startedCount, completedCount,
        completionPercentage: eligibleStudents > 0 ? Number(((completedCount / eligibleStudents) * 100).toFixed(2)) : 0,
        averageScore: Number(averageScore.toFixed(2)),
        medianScore: Number(medianScore.toFixed(2)),
        highestScore, lowestScore, passRate,
        averageTimeSeconds: Number(avgTime.toFixed(0)),
        autoSubmitCount,
        manualReviewPendingCount: results.filter((r) => r.status === RESULT_STATUS.MANUAL_REVIEW_REQUIRED).length,
        scoreDistribution: distribution,
        calculatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return snapshot;
  }

  static async computeQuestionAnalytics(quizId) {
    const scores = await QuestionScore.find({ resultId: { $in: await QuizResult.distinct('_id', { quizId }) } }).lean();

    const byQuestion = {};
    for (const score of scores) {
      const qId = score.questionId.toString();
      if (!byQuestion[qId]) {
        byQuestion[qId] = {
          questionId: score.questionId,
          topic: score.topic,
          totalResponses: 0,
          correctResponses: 0,
          incorrectResponses: 0,
          partialResponses: 0,
          unansweredResponses: 0,
          totalMarksAwarded: 0,
          totalMarksAvailable: 0,
          optionCounts: {},
        };
      }
      const b = byQuestion[qId];
      b.totalResponses++;
      b.totalMarksAwarded += score.marksAwarded || 0;
      b.totalMarksAvailable += score.marksAvailable || 0;
      if (score.correctness === 'correct') b.correctResponses++;
      else if (score.correctness === 'incorrect') b.incorrectResponses++;
      else if (score.correctness === 'partially_correct') b.partialResponses++;
      else if (score.correctness === 'unanswered') b.unansweredResponses++;

      for (const optId of (score.selectedOptionIds || [])) {
        const key = optId.toString();
        b.optionCounts[key] = (b.optionCounts[key] || 0) + 1;
      }
    }

    const bulkOps = Object.values(byQuestion).map((data) => {
      const accuracy = data.totalResponses > 0 ? Number(((data.correctResponses / data.totalResponses) * 100).toFixed(2)) : 0;
      const avgMarks = data.totalResponses > 0 ? Number((data.totalMarksAwarded / data.totalResponses).toFixed(2)) : 0;

      // Wrong-option: most selected option that is NOT the correct answer
      const wrongOptEntry = Object.entries(data.optionCounts).sort(([, a], [, b]) => b - a)[0];
      const mostSelectedWrongOptionId = wrongOptEntry ? wrongOptEntry[0] : null;

      return {
        updateOne: {
          filter: { quizId, questionId: data.questionId },
          update: {
            $set: {
              quizId, questionId: data.questionId, topic: data.topic,
              totalResponses: data.totalResponses,
              correctResponses: data.correctResponses,
              incorrectResponses: data.incorrectResponses,
              partialResponses: data.partialResponses,
              unansweredResponses: data.unansweredResponses,
              accuracyPercentage: accuracy,
              averageMarks: avgMarks,
              optionDistribution: data.optionCounts,
              mostSelectedWrongOptionId,
              calculatedAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      await QuestionAnalyticsSnapshot.bulkWrite(bulkOps);
    }

    return await QuestionAnalyticsSnapshot.find({ quizId }).lean();
  }
}
