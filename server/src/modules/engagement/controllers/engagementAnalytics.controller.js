import { ConfusionHeatmapService } from '../services/confusionHeatmap.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export async function getConfusionHeatmap(req, res, next) {
  try {
    const { classId } = req.params;
    const heatmap = await ConfusionHeatmapService.calculateConfusionHeatmap(classId);
    return ApiResponse.success(res, 200, 'Confusion heatmap generated', { heatmap });
  } catch (error) {
    next(error);
  }
}

export async function getEngagementOverview(req, res, next) {
  try {
    const { classId } = req.params;
    const heatmap = await ConfusionHeatmapService.calculateConfusionHeatmap(classId);
    return ApiResponse.success(res, 200, 'Engagement overview fetched', {
      heatmap,
      summary: {
        totalTopics: heatmap.length,
        criticalCount: heatmap.filter((h) => h.classification === 'critical').length,
        highCount: heatmap.filter((h) => h.classification === 'high').length,
      },
    });
  } catch (error) {
    next(error);
  }
}
