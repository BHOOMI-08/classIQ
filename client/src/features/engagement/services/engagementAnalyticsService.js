import { api } from '../../../services/api.js';

export const engagementAnalyticsService = {
  getConfusionHeatmap: (classId) => api.get(`/classes/${classId}/engagement/confusion-heatmap`),
  getEngagementOverview: (classId) => api.get(`/classes/${classId}/engagement/overview`),
};
