import { ResourceProgressService } from '../services/resourceProgress.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const recordOpen = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const progress = await ResourceProgressService.recordOpen({
      resourceId,
      classroomId: req.resource.classroomId,
      studentId: req.user._id,
    });
    return ApiResponse.success(res, 'Resource opened', { progress });
  } catch (err) {
    next(err);
  }
};

export const markCompleted = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const progress = await ResourceProgressService.markCompleted({
      resourceId,
      classroomId: req.resource.classroomId,
      studentId: req.user._id,
    });
    return ApiResponse.success(res, 'Resource marked completed', { progress });
  } catch (err) {
    next(err);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const { progressPercentage } = req.body;
    const progress = await ResourceProgressService.updateProgress({
      resourceId,
      studentId: req.user._id,
      percentage: progressPercentage,
    });
    return ApiResponse.success(res, 'Reading progress updated', { progress });
  } catch (err) {
    next(err);
  }
};
