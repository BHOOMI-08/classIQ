import { api } from '../../../services/api.js';

export const classroomTimelineService = {
  getTimeline: (classId, moduleFilter = 'all', page = 1, limit = 20) =>
    api.get(`/classes/${classId}/timeline?module=${moduleFilter}&page=${page}&limit=${limit}`),
};
