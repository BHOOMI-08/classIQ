import { HybridSearchService } from '../services/hybridSearch.service.js';
import { VectorSearchService } from '../services/vectorSearch.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const hybridSearch = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { query, topic, unit, resourceType } = req.query;
    const isPublishedOnly = req.user.role === 'student';

    const results = await HybridSearchService.search({
      classroomId: classId,
      query: query || '',
      topic,
      unit,
      resourceType,
      isPublishedOnly,
      limit: 15,
    });

    return ApiResponse.success(res, 'Search completed', { items: results, total: results.length });
  } catch (err) {
    next(err);
  }
};

export const semanticSearch = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { query } = req.body;

    const chunks = await VectorSearchService.searchChunks({
      query: query || '',
      classroomId: classId,
      limit: 10,
    });

    return ApiResponse.success(res, 'Semantic search completed', { items: chunks });
  } catch (err) {
    next(err);
  }
};
