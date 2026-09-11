import { Quiz } from '../models/quiz.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { ApiError } from '../../../utils/api-error.js';

export const requireQuizOwner = async (req, _res, next) => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) return next(ApiError.badRequest('Quiz ID is required'));

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return next(ApiError.notFound('Quiz not found'));

    const classroom = await Classroom.findById(quiz.classroomId);
    if (!classroom) return next(ApiError.notFound('Classroom not found'));

    const isTeacher = classroom.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      return next(ApiError.forbidden('Only the classroom teacher can manage this quiz'));
    }

    req.quiz = quiz;
    req.classroom = classroom;
    next();
  } catch (err) {
    next(err);
  }
};
