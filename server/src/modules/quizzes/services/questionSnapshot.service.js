import { QuizAttemptQuestion } from '../models/quizAttemptQuestion.model.js';
import { QuestionOption } from '../models/questionOption.model.js';

export class QuestionSnapshotService {
  /**
   * Create immutable QuizAttemptQuestion snapshots at attempt start.
   * Answer keys are stored with select:false — never returned in student APIs.
   */
  static async createSnapshots({ attemptId, quizId, questions, questionMaps, optionOrders, displayOrders }) {
    const snapshots = [];

    for (const map of questionMaps) {
      const question = questions.find((q) => q._id.toString() === map.questionId.toString());
      if (!question) continue;

      const displayOrder = displayOrders[map.questionId.toString()] ?? map.order;
      const options = await QuestionOption.find({ questionId: question._id }).sort({ order: 1 }).lean();

      // Apply per-attempt option ordering
      const orderedOptionIds = optionOrders[question._id.toString()] || options.map((o) => o._id.toString());
      const orderedOptions = orderedOptionIds
        .map((oid) => options.find((o) => o._id.toString() === oid))
        .filter(Boolean)
        .map((opt) => ({
          _id: opt._id,
          text: opt.text,
          label: opt.label,
          order: opt.order,
          misconceptionTag: opt.misconceptionTag || '',
          isCorrect: opt.isCorrect, // stored in DB but excluded by student serializer via select:false on the field
        }));

      const snapshot = {
        attemptId,
        quizId,
        originalQuestionId: question._id,
        questionVersion: question.version || 1,
        displayOrder,
        type: question.type,
        promptSnapshot: question.prompt,
        contextSnapshot: question.context || '',
        instructionsSnapshot: question.instructions || '',
        topicSnapshot: question.topic || '',
        difficultySnapshot: question.difficulty || 'medium',
        marks: map.marks,
        negativeMarks: map.negativeMarks || 0,
        optionSnapshot: orderedOptions,
        // Answer key material — stored but select:false keeps them out of student queries
        answerKeySnapshot: question.answerKey,
        acceptedAnswersSnapshot: question.acceptedAnswers || [],
        answerMatchingModeSnapshot: question.answerMatchingMode || 'manual',
        explanationSnapshot: question.explanation || '',
        caseSnapshot: question.caseId ? { caseId: question.caseId } : null,
        codingConfigSnapshot: question.codingConfig || null,
      };

      snapshots.push(snapshot);
    }

    const inserted = await QuizAttemptQuestion.insertMany(snapshots);
    return inserted;
  }
}
