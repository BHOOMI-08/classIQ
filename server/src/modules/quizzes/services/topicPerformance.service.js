import { QuestionScore } from '../models/questionScore.model.js';
import { TopicPerformance } from '../models/topicPerformance.model.js';
import { getProficiencyLabel } from '../utils/grading.utils.js';

export class TopicPerformanceService {
  static async generateTopicPerformance(resultId, attemptId, quizId, studentId, classroomId) {
    const scores = await QuestionScore.find({ resultId }).lean();

    const byTopic = {};
    for (const score of scores) {
      const topic = score.topic || 'general';
      if (!byTopic[topic]) {
        byTopic[topic] = {
          totalQuestions: 0,
          attemptedQuestions: 0,
          correctQuestions: 0,
          incorrectQuestions: 0,
          partialQuestions: 0,
          marksAvailable: 0,
          marksAwarded: 0,
          timeSamples: [],
        };
      }
      const t = byTopic[topic];
      t.totalQuestions++;
      t.marksAvailable += score.marksAvailable;
      t.marksAwarded += score.marksAwarded;

      if (score.correctness !== 'unanswered' && score.correctness !== 'pending_review') t.attemptedQuestions++;
      if (score.correctness === 'correct') t.correctQuestions++;
      if (score.correctness === 'incorrect') t.incorrectQuestions++;
      if (score.correctness === 'partially_correct') t.partialQuestions++;
    }

    const performances = Object.entries(byTopic).map(([topic, data]) => {
      const accuracyPercentage = data.attemptedQuestions > 0
        ? Number(((data.correctQuestions / data.totalQuestions) * 100).toFixed(2))
        : 0;
      return {
        resultId, attemptId, quizId, studentId, classroomId, topic,
        totalQuestions: data.totalQuestions,
        attemptedQuestions: data.attemptedQuestions,
        correctQuestions: data.correctQuestions,
        incorrectQuestions: data.incorrectQuestions,
        partialQuestions: data.partialQuestions,
        marksAvailable: data.marksAvailable,
        marksAwarded: data.marksAwarded,
        accuracyPercentage,
        proficiencyLabel: getProficiencyLabel(accuracyPercentage),
      };
    });

    if (performances.length > 0) {
      await TopicPerformance.insertMany(performances);
    }

    return performances;
  }
}
