import { RevisionQueueService } from '../services/revisionQueue.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const addToRevisionQueue = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { priority, reason, source } = req.body;
    const item = await RevisionQueueService.addToQueue({
      studentId: req.user._id,
      classroomId: req.resource.classroomId,
      resourceId,
      priority,
      reason,
      source,
    });
    return ApiResponse.created(res, 'Added to revision queue', { item });
  } catch (err) {
    next(err);
  }
};

export const removeFromRevisionQueue = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    await RevisionQueueService.removeFromQueue({
      studentId: req.user._id,
      resourceId,
    });
    return ApiResponse.success(res, 'Removed from revision queue');
  } catch (err) {
    next(err);
  }
};

export const getStudentRevisionQueue = async (req, res, next) => {
  try {
    const items = await RevisionQueueService.getStudentRevisionQueue(req.user._id);
    return ApiResponse.success(res, 'Revision queue retrieved', { items });
  } catch (err) {
    next(err);
  }
};
