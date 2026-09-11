import { QuizAttemptService } from '../services/quizAttempt.service.js';
import { QuizSubmissionService } from '../services/quizSubmission.service.js';
import { QuizAccessService } from '../services/quizAccess.service.js';
import { QuizAttempt } from '../models/quizAttempt.model.js';
import { QuizAttemptEvent } from '../models/quizAttemptEvent.model.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const startAttempt = async (req, res, next) => {
  try {
    const result = await QuizAttemptService.startAttempt(req.params.quizId, req.user._id);
    ApiResponse.success(res, result.resuming ? 200 : 201, result.resuming ? 'Attempt resumed' : 'Attempt started', result);
  } catch (err) { next(err); }
};

export const getAttemptState = async (req, res, next) => {
  try {
    const state = await QuizAttemptService.getAttemptState(req.params.attemptId, req.user._id);
    ApiResponse.success(res, 200, 'Attempt state fetched', state);
  } catch (err) { next(err); }
};

export const submitAttempt = async (req, res, next) => {
  try {
    const result = await QuizSubmissionService.submitAttempt(req.params.attemptId, req.user._id);
    ApiResponse.success(res, 200, 'Attempt submitted successfully', result);
  } catch (err) { next(err); }
};

export const getEligibility = async (req, res, next) => {
  try {
    const result = await QuizAccessService.resolveEligibility(req.params.quizId, req.user._id);
    ApiResponse.success(res, 200, 'Eligibility checked', result);
  } catch (err) { next(err); }
};

export const trackEvent = async (req, res, next) => {
  try {
    const { eventType, metadata, clientTimestamp } = req.body;
    const { attemptId } = req.params;
    const attempt = await QuizAttempt.findById(attemptId).lean();
    if (!attempt) return next(new Error('Attempt not found'));

    await QuizAttemptEvent.create({
      attemptId,
      quizId: attempt.quizId,
      studentId: req.user._id,
      eventType,
      metadata: metadata || {},
      clientTimestamp: clientTimestamp ? new Date(clientTimestamp) : null,
      serverTimestamp: new Date(),
    });

    // Update suspicious event count for certain events
    const suspiciousEvents = ['tab_hidden', 'fullscreen_exited'];
    if (suspiciousEvents.includes(eventType)) {
      const field = eventType === 'tab_hidden' ? 'tabSwitchCount' : 'fullscreenExitCount';
      await QuizAttempt.updateOne({ _id: attemptId }, { $inc: { suspiciousEventCount: 1, [field]: 1 } });
    }

    ApiResponse.success(res, 200, 'Event recorded', {});
  } catch (err) { next(err); }
};
