import { ContentChunk } from '../models/contentChunk.model.js';
import { EmbeddingService } from './embedding.service.js';

export class VectorSearchService {
  /**
   * Run semantic vector search over active content chunks.
   */
  static async searchChunks({ query, classroomId, limit = 10, resourceIds = null }) {
    const queryVector = await EmbeddingService.generateEmbedding(query);

    const filter = {
      classroomId,
      isActive: true,
    };
    if (resourceIds && resourceIds.length > 0) {
      filter.resourceId = { $in: resourceIds };
    }

    const chunks = await ContentChunk.find(filter)
      .populate('resourceId', 'title resourceType topic unit status slug currentVersionId')
      .lean();

    // Compute similarity scores
    const scoredChunks = chunks.map((chunk) => {
      const similarity = chunk.embedding && chunk.embedding.length > 0
        ? EmbeddingService.cosineSimilarity(queryVector, chunk.embedding)
        : 0;
      return {
        ...chunk,
        score: Number(similarity.toFixed(4)),
      };
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, limit);
  }
}
