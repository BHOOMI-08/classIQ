import { Poll } from '../models/poll.model.js';
import { PollOption } from '../models/pollOption.model.js';
import { PollResponse } from '../models/pollResponse.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { POLL_STATUS } from '../utils/engagement.constants.js';
import { EngagementActivityService } from './engagementActivity.service.js';
import { getIO } from '../../../socket/socket.server.js';
import { ApiError } from '../../../utils/api-error.js';

export class PollService {
  /**
   * Create a new Poll and options.
   */
  static async createPoll(teacherId, classId, payload) {
    const classroom = await Classroom.findById(classId).lean();
    if (!classroom || classroom.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('You are not the owner of this classroom');
    }

    const poll = await Poll.create({
      classroomId: classId,
      teacherId,
      question: payload.question,
      description: payload.description || '',
      type: payload.type || 'single_choice',
      topic: payload.topic || 'General Topic',
      status: POLL_STATUS.DRAFT,
      anonymous: payload.anonymous || false,
      randomizeOptions: payload.randomizeOptions || false,
      allowResponseChange: payload.allowResponseChange || false,
      showLiveResults: payload.showLiveResults !== false,
      showCorrectAnswerAfterClose: payload.showCorrectAnswerAfterClose !== false,
      explanation: payload.explanation || '',
    });

    const optionDocs = (payload.options || []).map((opt, idx) => ({
      pollId: poll._id,
      text: opt.text,
      order: idx,
      isCorrect: Boolean(opt.isCorrect),
      misconceptionTag: opt.misconceptionTag || '',
    }));

    const options = await PollOption.insertMany(optionDocs);

    return { poll, options };
  }

  /**
   * Start poll session and broadcast event.
   */
  static async startPoll(teacherId, pollId, durationMinutes = 5) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound('Poll not found');

    if (poll.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('Unauthorized to start this poll');
    }

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

    poll.status = POLL_STATUS.ACTIVE;
    poll.startedAt = startedAt;
    poll.endsAt = endsAt;
    await poll.save();

    const options = await PollOption.find({ pollId }).sort({ order: 1 }).lean();

    // Strip isCorrect for student delivery
    const sanitizedOptions = options.map((opt) => ({
      _id: opt._id,
      text: opt.text,
      order: opt.order,
    }));

    await EngagementActivityService.logActivity({
      classroomId: poll.classroomId,
      actorId: teacherId,
      actorRole: 'teacher',
      eventType: 'poll_started',
      sourceModule: 'engagement',
      sourceId: poll._id,
      title: 'Live Poll Started',
      summary: poll.question,
    });

    try {
      const io = getIO();
      io.to(`classroom:${poll.classroomId}:engagement`).emit('engagement:poll-started', {
        poll,
        options: sanitizedOptions,
      });
    } catch (_) {}

    return { poll, options: sanitizedOptions };
  }

  /**
   * Submit student poll response.
   */
  static async respondPoll(studentId, pollId, { selectedOptionIds = [], textResponse = '' }) {
    const poll = await Poll.findById(pollId);
    if (!poll || poll.status !== POLL_STATUS.ACTIVE) {
      throw ApiError.badRequest('This poll session is not active');
    }

    const isEnrolled = await Enrollment.findOne({ classroomId: poll.classroomId, studentId, status: 'active' });
    if (!isEnrolled) throw ApiError.forbidden('You are not enrolled in this classroom');

    // Evaluate accuracy if objective poll type
    let isCorrect = null;
    if (selectedOptionIds.length > 0) {
      const options = await PollOption.find({ pollId }).lean();
      const correctOptionIds = new Set(options.filter((o) => o.isCorrect).map((o) => o._id.toString()));

      if (correctOptionIds.size > 0) {
        const studentSet = new Set(selectedOptionIds.map((id) => id.toString()));
        const isMatch = correctOptionIds.size === studentSet.size && [...correctOptionIds].every((id) => studentSet.has(id));
        isCorrect = isMatch;
      }
    }

    let responseDoc = await PollResponse.findOne({ pollId, studentId });
    if (responseDoc) {
      if (!poll.allowResponseChange) {
        throw ApiError.badRequest('Response updates are disabled for this poll');
      }
      responseDoc.selectedOptionIds = selectedOptionIds;
      responseDoc.textResponse = textResponse;
      responseDoc.isCorrect = isCorrect;
      responseDoc.lastRespondedAt = new Date();
      await responseDoc.save();
    } else {
      responseDoc = await PollResponse.create({
        pollId,
        classroomId: poll.classroomId,
        studentId,
        selectedOptionIds,
        textResponse,
        isCorrect,
      });
      poll.totalResponses += 1;
      await poll.save();
    }

    // Broadcast results if live results enabled
    const results = await this.getPollResults(pollId, 'student');
    try {
      const io = getIO();
      io.to(`classroom:${poll.classroomId}:engagement`).emit('engagement:poll-updated', {
        pollId,
        results,
      });
    } catch (_) {}

    return responseDoc;
  }

  /**
   * Close poll session manually.
   */
  static async closePoll(teacherId, pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound('Poll not found');

    if (poll.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('Unauthorized');
    }

    poll.status = POLL_STATUS.CLOSED;
    poll.closedAt = new Date();
    await poll.save();

    const results = await this.getPollResults(pollId, 'teacher');

    try {
      const io = getIO();
      io.to(`classroom:${poll.classroomId}:engagement`).emit('engagement:poll-closed', {
        pollId,
        results,
      });
    } catch (_) {}

    return { poll, results };
  }

  /**
   * Reveal correct answer to students after poll is closed.
   */
  static async revealAnswer(teacherId, pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) throw ApiError.notFound('Poll not found');

    if (poll.teacherId.toString() !== teacherId.toString()) {
      throw ApiError.forbidden('Unauthorized');
    }

    const options = await PollOption.find({ pollId }).sort({ order: 1 }).lean();
    const correctOptions = options.filter((o) => o.isCorrect);

    try {
      const io = getIO();
      io.to(`classroom:${poll.classroomId}:engagement`).emit('engagement:poll-answer-revealed', {
        pollId,
        explanation: poll.explanation,
        correctOptions,
      });
    } catch (_) {}

    return { poll, correctOptions };
  }

  /**
   * Calculate live poll results & option distribution.
   */
  static async getPollResults(pollId, requesterRole = 'student') {
    const poll = await Poll.findById(pollId).lean();
    if (!poll) throw ApiError.notFound('Poll not found');

    const totalEligible = await Enrollment.countDocuments({ classroomId: poll.classroomId, status: 'active' });
    const options = await PollOption.find({ pollId }).sort({ order: 1 }).lean();
    const responses = await PollResponse.find({ pollId }).lean();

    const totalResponses = responses.length;
    const optionCounts = {};
    options.forEach((o) => { optionCounts[o._id.toString()] = 0; });

    let correctCount = 0;
    let incorrectCount = 0;

    responses.forEach((r) => {
      if (r.isCorrect === true) correctCount += 1;
      else if (r.isCorrect === false) incorrectCount += 1;

      (r.selectedOptionIds || []).forEach((optId) => {
        const idStr = optId.toString();
        if (optionCounts[idStr] !== undefined) {
          optionCounts[idStr] += 1;
        }
      });
    });

    const optionDistribution = options.map((o) => {
      const count = optionCounts[o._id.toString()] || 0;
      const percentage = totalResponses > 0 ? Number(((count / totalResponses) * 100).toFixed(1)) : 0;
      return {
        optionId: o._id,
        text: o.text,
        count,
        percentage,
        isCorrect: (requesterRole === 'teacher' || poll.status === 'closed') ? o.isCorrect : undefined,
      };
    });

    const accuracyPercentage = totalResponses > 0 ? Number(((correctCount / totalResponses) * 100).toFixed(1)) : 0;

    return {
      pollId: poll._id,
      question: poll.question,
      status: poll.status,
      totalEligible,
      totalResponses,
      nonResponseCount: Math.max(0, totalEligible - totalResponses),
      correctCount,
      incorrectCount,
      accuracyPercentage,
      optionDistribution,
    };
  }
}
