import { Question } from '../models/question.model.js';
import { QuestionOption } from '../models/questionOption.model.js';
import { QuizQuestionMap } from '../models/quizQuestionMap.model.js';
import { Quiz } from '../models/quiz.model.js';
import { ApiError } from '../../../utils/api-error.js';
import { QuestionValidationService } from './questionValidation.service.js';

export class QuestionService {
  static async createQuestion({ classroomId, teacherId, questionData }) {
    await QuestionValidationService.validate(questionData);
    const question = await Question.create({ classroomId, teacherId, ...questionData, status: 'draft' });

    // Create options if present
    if (Array.isArray(questionData.options) && questionData.options.length > 0) {
      const options = questionData.options.map((opt, idx) => ({
        questionId: question._id,
        text: opt.text,
        label: opt.label || String.fromCharCode(65 + idx), // A, B, C, D...
        order: opt.order ?? idx,
        isCorrect: opt.isCorrect || false,
        feedback: opt.feedback || '',
        misconceptionTag: opt.misconceptionTag || '',
      }));
      await QuestionOption.insertMany(options);
    }

    return question;
  }

  static async getQuestionsWithOptions(questionIds) {
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const options = await QuestionOption.find({ questionId: { $in: questionIds } }).sort({ order: 1 }).lean();

    const optionsByQuestion = {};
    for (const opt of options) {
      const qId = opt.questionId.toString();
      if (!optionsByQuestion[qId]) optionsByQuestion[qId] = [];
      optionsByQuestion[qId].push(opt);
    }

    return questions.map((q) => ({
      ...q,
      options: optionsByQuestion[q._id.toString()] || [],
    }));
  }

  static async addQuestionToQuiz({ quizId, questionId, marks, negativeMarks = 0 }) {
    const question = await Question.findById(questionId).lean();
    if (!question) throw ApiError.notFound('Question not found');

    const existingOrder = await QuizQuestionMap.countDocuments({ quizId });
    const mapMarks = marks ?? question.defaultMarks ?? 0;
    const map = await QuizQuestionMap.create({
      quizId,
      questionId,
      questionVersion: question.version || 1,
      order: existingOrder + 1,
      marks: mapMarks,
      negativeMarks: negativeMarks ?? question.defaultNegativeMarks ?? 0,
      topicSnapshot: question.topic,
      difficultySnapshot: question.difficulty,
    });

    await Quiz.updateOne(
      { _id: quizId },
      { $inc: { totalQuestions: 1, totalMarks: mapMarks } }
    );

    return map;
  }

  static async getQuizQuestions(quizId) {
    const maps = await QuizQuestionMap.find({ quizId }).sort({ order: 1 }).lean();
    const questionIds = maps.map((m) => m.questionId);
    const questionsWithOptions = await QuestionService.getQuestionsWithOptions(questionIds);

    const questionMap = {};
    for (const q of questionsWithOptions) questionMap[q._id.toString()] = q;

    return maps.map((m) => ({
      ...m,
      question: questionMap[m.questionId.toString()],
    }));
  }

  static async getClassroomQuestionBank(classroomId, { topic, difficulty, type } = {}) {
    const filter = { classroomId, status: 'active' };
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    const questions = await Question.find(filter).sort({ createdAt: -1 }).lean();
    return questions;
  }
}
