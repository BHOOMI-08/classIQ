import { Quiz } from '../models/quiz.model.js';
import { QuizQuestionMap } from '../models/quizQuestionMap.model.js';
import { generateQuizSlug } from '../utils/quizSlug.utils.js';
import { ApiError } from '../../../utils/api-error.js';
import { QUIZ_STATUS } from '../utils/quiz.constants.js';

export class QuizService {
  static async createDraft({ classroomId, teacherId, data }) {
    const slug = generateQuizSlug(data.title);
    const quiz = await Quiz.create({
      classroomId,
      teacherId,
      slug,
      ...data,
      status: QUIZ_STATUS.DRAFT,
    });
    return quiz;
  }

  static async getQuizById(quizId) {
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) throw ApiError.notFound('Quiz not found');
    return quiz;
  }

  static async getClassroomQuizzes(classroomId, { status, studentView = false } = {}) {
    const filter = { classroomId };
    if (status) {
      filter.status = status;
    } else if (studentView) {
      filter.status = { $in: [QUIZ_STATUS.PUBLISHED, QUIZ_STATUS.ACTIVE, QUIZ_STATUS.CLOSED] };
    }
    return Quiz.find(filter).sort({ createdAt: -1 }).lean();
  }

  static async updateQuiz(quizId, teacherId, updates) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw ApiError.notFound('Quiz not found');

    // If attempts have started, freeze assessment-critical fields
    if (quiz.totalAttempts > 0) {
      const frozenFields = ['totalMarks', 'passingMarks', 'durationMinutes', 'negativeMarkingEnabled', 'defaultNegativeMarks', 'partialMarkingEnabled', 'randomizeQuestions', 'randomizeOptions', 'questionSelectionMode', 'questionsPerAttempt'];
      for (const field of frozenFields) {
        if (updates[field] !== undefined) {
          throw ApiError.conflict(`Cannot modify "${field}" after attempts have started. Duplicate the quiz for major changes.`);
        }
      }
    }

    Object.assign(quiz, updates);
    await quiz.save();
    return quiz;
  }

  static async duplicateQuiz(quizId, teacherId) {
    const original = await Quiz.findById(quizId).lean();
    if (!original) throw ApiError.notFound('Original quiz not found');

    const slug = generateQuizSlug(`${original.title} Copy`);
    const { _id, publishedAt, openingAt, closingAt, scheduledPublishAt, totalAttempts, completedAttempts, averageScore, highestScore, lowestScore, ...rest } = original;

    const duplicate = await Quiz.create({
      ...rest,
      slug,
      title: `${original.title} (Copy)`,
      status: QUIZ_STATUS.DRAFT,
      publishedAt: null,
      openingAt: null,
      closingAt: null,
      scheduledPublishAt: null,
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: null,
      createdAt: undefined,
      updatedAt: undefined,
    });

    // Duplicate question maps
    const maps = await QuizQuestionMap.find({ quizId }).lean();
    if (maps.length > 0) {
      const newMaps = maps.map(({ _id: mId, ...m }) => ({ ...m, quizId: duplicate._id }));
      await QuizQuestionMap.insertMany(newMaps);
    }

    return duplicate;
  }

  static async archiveQuiz(quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw ApiError.notFound('Quiz not found');
    quiz.status = QUIZ_STATUS.ARCHIVED;
    quiz.archivedAt = new Date();
    await quiz.save();
    return quiz;
  }

  static async cancelQuiz(quizId, reason) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw ApiError.notFound('Quiz not found');
    if ([QUIZ_STATUS.ARCHIVED, QUIZ_STATUS.CANCELLED].includes(quiz.status)) {
      throw ApiError.conflict('Quiz is already cancelled or archived');
    }
    quiz.status = QUIZ_STATUS.CANCELLED;
    quiz.cancelledAt = new Date();
    await quiz.save();
    return quiz;
  }
}
