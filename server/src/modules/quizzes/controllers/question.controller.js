import { QuestionService } from '../services/question.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const createQuestion = async (req, res, next) => {
  try {
    const classroomId = req.quiz?.classroomId || req.classroom?._id || req.params.classId;
    const question = await QuestionService.createQuestion({ classroomId, teacherId: req.user._id, questionData: req.body });
    if (req.params.quizId) {
      await QuestionService.addQuestionToQuiz({
        quizId: req.params.quizId,
        questionId: question._id,
        marks: req.body.marks,
        negativeMarks: req.body.negativeMarks,
      });
    }
    ApiResponse.created(res, { question }, 'Question created');
  } catch (err) { next(err); }
};

export const addQuestionToQuiz = async (req, res, next) => {
  try {
    const { questionId, marks, negativeMarks } = req.body;
    const map = await QuestionService.addQuestionToQuiz({ quizId: req.params.quizId, questionId, marks, negativeMarks });
    ApiResponse.created(res, { map }, 'Question added to quiz');
  } catch (err) { next(err); }
};

export const getQuizQuestions = async (req, res, next) => {
  try {
    const questions = await QuestionService.getQuizQuestions(req.params.quizId);
    ApiResponse.success(res, 200, 'Questions fetched', { questions });
  } catch (err) { next(err); }
};

export const getQuestionBank = async (req, res, next) => {
  try {
    const { topic, difficulty, type } = req.query;
    const classroomId = req.params.classId;
    const questions = await QuestionService.getClassroomQuestionBank(classroomId, { topic, difficulty, type });
    ApiResponse.success(res, 200, 'Question bank fetched', { questions });
  } catch (err) { next(err); }
};
