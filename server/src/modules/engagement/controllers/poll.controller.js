import { PollService } from '../services/poll.service.js';
import { ApiResponse } from '../../../utils/api-response.js';
import { Poll } from '../models/poll.model.js';

export async function createPoll(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { classId } = req.params;

    const result = await PollService.createPoll(teacherId, classId, req.body);
    return ApiResponse.created(res, result, 'Live poll created successfully');
  } catch (error) {
    next(error);
  }
}

export async function getClassroomPolls(req, res, next) {
  try {
    const { classId } = req.params;
    const polls = await Poll.find({ classroomId: classId }).sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, 200, 'Polls fetched successfully', { polls });
  } catch (error) {
    next(error);
  }
}

export async function getPollById(req, res, next) {
  try {
    const { pollId } = req.params;
    const requesterRole = req.user.role;

    const results = await PollService.getPollResults(pollId, requesterRole);
    return ApiResponse.success(res, 200, 'Poll fetched successfully', results);
  } catch (error) {
    next(error);
  }
}

export async function startPoll(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { pollId } = req.params;
    const { durationMinutes } = req.body;

    const result = await PollService.startPoll(teacherId, pollId, durationMinutes);
    return ApiResponse.success(res, 200, 'Poll session started', result);
  } catch (error) {
    next(error);
  }
}

export async function respondPoll(req, res, next) {
  try {
    const studentId = req.user._id;
    const { pollId } = req.params;

    const response = await PollService.respondPoll(studentId, pollId, req.body);
    return ApiResponse.success(res, 200, 'Poll response submitted successfully', { response });
  } catch (error) {
    next(error);
  }
}

export async function closePoll(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { pollId } = req.params;

    const result = await PollService.closePoll(teacherId, pollId);
    return ApiResponse.success(res, 200, 'Poll closed successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function revealPollAnswer(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { pollId } = req.params;

    const result = await PollService.revealAnswer(teacherId, pollId);
    return ApiResponse.success(res, 200, 'Poll correct answer revealed', result);
  } catch (error) {
    next(error);
  }
}
