import { ContentChunk } from '../../content/models/contentChunk.model.js';
import { ContentResource } from '../../content/models/contentResource.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { AIEmbeddingService } from './embedding.service.js';
import { ApiError } from '../../../utils/api-error.js';
import { normalizeSourceMetadata } from '../utils/source-normalizer.js';
import { estimateTokenCount } from '../utils/token-estimator.js';

export class AIRetrievalService {
  /**
   * Production RAG retrieval pipeline.
   */
  static async retrieveContext({
    query,
    classroomId,
    userId,
    userRole,
    selectedResourceIds = [],
    topK = 5,
    minScore = 0.15,
    maxTokenBudget = 2000,
  }) {
    // 1. Authorization & Tenant Isolation Check
    if (userRole === 'student') {
      const isEnrolled = await Enrollment.findOne({ classroomId, studentId: userId, status: 'active' });
      if (!isEnrolled) {
        throw ApiError.forbidden('You are not enrolled in this classroom');
      }
    } else if (userRole === 'teacher') {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom || classroom.teacherId.toString() !== userId.toString()) {
        throw ApiError.forbidden('You are not the teacher of this classroom');
      }
    }

    // 2. Resolve Published Active Resources
    const resourceFilter = { classroomId, status: 'published' };
    if (selectedResourceIds && selectedResourceIds.length > 0) {
      resourceFilter._id = { $in: selectedResourceIds };
    }

    const publishedResources = await ContentResource.find(resourceFilter).select('_id title').lean();
    if (publishedResources.length === 0) {
      return { chunks: [], packedContext: '', citations: [], totalRetrievedTokens: 0 };
    }

    const validResourceIds = publishedResources.map((r) => r._id);

    // 3. Generate Query Vector
    const queryVector = await AIEmbeddingService.generateEmbedding(query);

    // 4. Fetch Chunks from DB
    const chunkFilter = {
      classroomId,
      resourceId: { $in: validResourceIds },
      isActive: true,
    };

    const candidateChunks = await ContentChunk.find(chunkFilter)
      .populate('resourceId', 'title resourceType topic unit')
      .lean();

    if (candidateChunks.length === 0) {
      return { chunks: [], packedContext: '', citations: [], totalRetrievedTokens: 0 };
    }

    // 5. Score & Rank
    const scoredChunks = candidateChunks.map((chunk) => {
      const similarity = chunk.embedding && chunk.embedding.length > 0
        ? AIEmbeddingService.cosineSimilarity(queryVector, chunk.embedding)
        : 0.1;

      return {
        ...chunk,
        similarity: Number(similarity.toFixed(4)),
      };
    });

    // Filter by minScore & sort descending
    const filteredChunks = scoredChunks
      .filter((c) => c.similarity >= minScore)
      .sort((a, b) => b.similarity - a.similarity);

    // 6. Context Packing & Token Budget Guard
    const selectedChunks = [];
    const citations = [];
    let currentTokenCount = 0;
    let packedContextText = '';

    for (const chunk of filteredChunks) {
      if (selectedChunks.length >= topK) break;

      const chunkTokens = chunk.tokenEstimate || estimateTokenCount(chunk.text);
      if (currentTokenCount + chunkTokens > maxTokenBudget && selectedChunks.length > 0) {
        break; // Reached token capacity limit
      }

      selectedChunks.push(chunk);
      currentTokenCount += chunkTokens;

      const metadata = normalizeSourceMetadata(chunk);
      citations.push(metadata);

      packedContextText += `--- SOURCE CHUNK [Source: "${metadata.resourceTitle}", Page ${metadata.pageNumber}, Section: "${metadata.sectionTitle}"] ---\n${chunk.text}\n\n`;
    }

    return {
      chunks: selectedChunks,
      packedContext: packedContextText.trim(),
      citations,
      totalRetrievedTokens: currentTokenCount,
    };
  }
}
