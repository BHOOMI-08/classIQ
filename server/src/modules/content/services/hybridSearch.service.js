import { ContentResource } from '../models/contentResource.model.js';
import { VectorSearchService } from './vectorSearch.service.js';

export class HybridSearchService {
  /**
   * Execute Hybrid Search combining semantic similarity, text match, and metadata relevance.
   */
  static async search({ classroomId, query, topic, unit, resourceType, isPublishedOnly = true, limit = 10 }) {
    const resourceFilter = { classroomId };
    if (isPublishedOnly) {
      resourceFilter.status = 'published';
    } else {
      resourceFilter.status = { $ne: 'archived' };
    }

    if (topic) resourceFilter.topic = topic;
    if (unit) resourceFilter.unit = unit;
    if (resourceType) resourceFilter.resourceType = resourceType;

    // 1. Keyword search over title, description, topic, unit, tags
    let keywordResources = [];
    if (query && query.trim().length > 0) {
      const regex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      keywordResources = await ContentResource.find({
        ...resourceFilter,
        $or: [
          { title: regex },
          { description: regex },
          { topic: regex },
          { unit: regex },
          { tags: regex },
        ],
      })
        .limit(30)
        .lean();
    } else {
      keywordResources = await ContentResource.find(resourceFilter).limit(30).lean();
    }

    // 2. Vector search over active chunks
    let vectorResults = [];
    if (query && query.trim().length > 0) {
      vectorResults = await VectorSearchService.searchChunks({
        query,
        classroomId,
        limit: 20,
      });
    }

    // Group vector chunks by resource
    const vectorScoresMap = new Map();
    const chunkExcerptsMap = new Map();

    vectorResults.forEach((chunk) => {
      const resId = chunk.resourceId?._id?.toString() || chunk.resourceId?.toString();
      if (!resId) return;

      const currentScore = vectorScoresMap.get(resId) || 0;
      if (chunk.score > currentScore) {
        vectorScoresMap.set(resId, chunk.score);
        chunkExcerptsMap.set(resId, {
          text: chunk.text,
          pageNumber: chunk.pageNumber,
          sectionTitle: chunk.sectionTitle,
        });
      }
    });

    // 3. Combine scores
    const resourceMap = new Map();
    keywordResources.forEach((res) => {
      resourceMap.set(res._id.toString(), res);
    });

    // Ensure all vector matched resources are loaded if not in keyword set
    for (const chunk of vectorResults) {
      const resDoc = chunk.resourceId;
      if (resDoc && resDoc._id && !resourceMap.has(resDoc._id.toString())) {
        resourceMap.set(resDoc._id.toString(), resDoc);
      }
    }

    const combinedResults = [];
    for (const [resId, resource] of resourceMap.entries()) {
      const semanticScore = vectorScoresMap.get(resId) || 0;

      // Calculate Keyword Score
      let keywordScore = 0;
      if (query && query.trim()) {
        const qLower = query.toLowerCase();
        if (resource.title?.toLowerCase().includes(qLower)) keywordScore += 0.6;
        if (resource.description?.toLowerCase().includes(qLower)) keywordScore += 0.2;
        if (resource.topic?.toLowerCase().includes(qLower)) keywordScore += 0.1;
        if (resource.unit?.toLowerCase().includes(qLower)) keywordScore += 0.1;
      } else {
        keywordScore = 0.5;
      }
      keywordScore = Math.min(1.0, keywordScore);

      // Metadata score
      let metadataScore = 0.5;
      if (topic && resource.topic === topic) metadataScore += 0.25;
      if (unit && resource.unit === unit) metadataScore += 0.25;
      metadataScore = Math.min(1.0, metadataScore);

      // Hybrid Weighted Score
      const finalScore = Number((0.6 * semanticScore + 0.3 * keywordScore + 0.1 * metadataScore).toFixed(4));

      combinedResults.push({
        resource,
        relevanceScore: finalScore,
        semanticScore,
        keywordScore,
        matchingExcerpt: chunkExcerptsMap.get(resId) || null,
      });
    }

    combinedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return combinedResults.slice(0, limit);
  }
}
