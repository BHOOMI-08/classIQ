import { QuizAccessGrant } from '../models/quizAccessGrant.model.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const createGrant = async (req, res, next) => {
  try {
    const { studentId, extraAttempts = 0, extendedOpeningAt, extendedClosingAt, extraDurationMinutes = 0, reason } = req.body;
    const grant = await QuizAccessGrant.create({
      quizId: req.params.quizId,
      classroomId: req.quiz.classroomId,
      studentId,
      createdBy: req.user._id,
      extraAttempts,
      extendedOpeningAt: extendedOpeningAt ? new Date(extendedOpeningAt) : null,
      extendedClosingAt: extendedClosingAt ? new Date(extendedClosingAt) : null,
      extraDurationMinutes,
      reason,
    });
    ApiResponse.created(res, { grant }, 'Access grant created');
  } catch (err) { next(err); }
};

export const getGrants = async (req, res, next) => {
  try {
    const grants = await QuizAccessGrant.find({ quizId: req.params.quizId })
      .populate('studentId', 'name email')
      .lean();
    ApiResponse.success(res, 200, 'Grants fetched', { grants });
  } catch (err) { next(err); }
};

export const revokeGrant = async (req, res, next) => {
  try {
    const grant = await QuizAccessGrant.findOneAndUpdate(
      { _id: req.params.grantId, quizId: req.params.quizId },
      { $set: { status: 'revoked' } },
      { new: true }
    );
    if (!grant) return next(new Error('Grant not found'));
    ApiResponse.success(res, 200, 'Grant revoked', { grant });
  } catch (err) { next(err); }
};
