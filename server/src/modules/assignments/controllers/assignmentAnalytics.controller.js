import { AssignmentAnalyticsService } from '../services/assignmentAnalytics.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const getAssignmentAnalytics = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const analytics = await AssignmentAnalyticsService.getAssignmentAnalytics(assignmentId);
    return ApiResponse.success(res, 'Assignment analytics retrieved', { analytics });
  } catch (err) {
    next(err);
  }
};
