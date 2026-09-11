import { DoubtService } from '../services/doubt.service.js';
import { DoubtClusteringService } from '../services/doubtClustering.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export async function submitDoubt(req, res, next) {
  try {
    const studentId = req.user._id;
    const { classId } = req.params;

    const result = await DoubtService.submitDoubt(studentId, classId, req.body);
    return ApiResponse.created(res, result, 'Doubt submitted successfully');
  } catch (error) {
    next(error);
  }
}

export async function getClassroomDoubts(req, res, next) {
  try {
    const { classId } = req.params;
    const { status, topic } = req.query;

    const result = await DoubtService.getClassroomDoubts(classId, { status, topic });
    return ApiResponse.success(res, 200, 'Doubts fetched successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function getStudentMyDoubts(req, res, next) {
  try {
    const studentId = req.user._id;
    const { classId } = req.params;
    const { Doubt } = await import('../models/doubt.model.js');

    const myDoubts = await Doubt.find({ classroomId: classId, studentId }).sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, 200, 'Student doubts fetched', { doubts: myDoubts });
  } catch (error) {
    next(error);
  }
}

export async function upvoteDoubt(req, res, next) {
  try {
    const studentId = req.user._id;
    const { doubtId } = req.params;

    const result = await DoubtService.upvoteDoubt(studentId, doubtId);
    return ApiResponse.success(res, 200, 'Doubt upvoted successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function removeDoubtUpvote(req, res, next) {
  try {
    const studentId = req.user._id;
    const { doubtId } = req.params;

    const result = await DoubtService.removeUpvote(studentId, doubtId);
    return ApiResponse.success(res, 200, 'Upvote removed', result);
  } catch (error) {
    next(error);
  }
}

export async function resolveDoubt(req, res, next) {
  try {
    const teacherId = req.user._id;
    const { doubtId } = req.params;
    const { resolutionNote } = req.body;

    const doubt = await DoubtService.resolveDoubt(teacherId, doubtId, resolutionNote);
    return ApiResponse.success(res, 200, 'Doubt marked as resolved', { doubt });
  } catch (error) {
    next(error);
  }
}

export async function rebuildDoubtClusters(req, res, next) {
  try {
    const { classId } = req.params;
    const result = await DoubtClusteringService.clusterUnresolvedDoubts(classId);
    return ApiResponse.success(res, 200, 'Doubt clusters rebuilt', result);
  } catch (error) {
    next(error);
  }
}
