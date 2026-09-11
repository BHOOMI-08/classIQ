import { Doubt } from '../models/doubt.model.js';
import { normalizeText, calculateKeywordSimilarity, classifyDoubtSimilarity } from '../utils/textSimilarity.utils.js';
import { AIEmbeddingService } from '../../ai/services/embedding.service.js';

export class DoubtMatchingService {
  /**
   * Two-Stage Doubt Deduplication Matcher.
   * Stage 1: Normalized keyword similarity search.
   * Stage 2: Embedding vector similarity matching using AIEmbeddingService when available.
   */
  static async findMatchingDoubts(classroomId, text = '') {
    const normalizedInput = normalizeText(text);
    if (!normalizedInput || normalizedInput.length < 3) {
      return { matchType: 'no_match', matchingDoubts: [] };
    }

    // Fetch open & recent unresolved doubts in classroom
    const existingDoubts = await Doubt.find({
      classroomId,
      status: { $in: ['open', 'grouped', 'acknowledged'] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (existingDoubts.length === 0) {
      return { matchType: 'no_match', matchingDoubts: [] };
    }

    // 1. Stage 1: Keyword Jaccard Similarity
    const scoredDoubts = [];
    for (const d of existingDoubts) {
      const kwScore = calculateKeywordSimilarity(normalizedInput, d.normalizedText);
      scoredDoubts.push({
        doubt: d,
        keywordScore: kwScore,
        vectorScore: 0,
        finalScore: kwScore,
      });
    }

    // Sort by initial keyword score
    scoredDoubts.sort((a, b) => b.finalScore - a.finalScore);

    // 2. Stage 2: Embedding Vector Similarity on Top 10 Candidates if available
    const topCandidates = scoredDoubts.slice(0, 10).filter((c) => c.keywordScore >= 0.2);

    if (topCandidates.length > 0) {
      try {
        const queryVector = await AIEmbeddingService.generateEmbedding(normalizedInput);
        for (const candidate of topCandidates) {
          const candidateVector = await AIEmbeddingService.generateEmbedding(candidate.doubt.normalizedText);
          const sim = AIEmbeddingService.cosineSimilarity(queryVector, candidateVector);
          candidate.vectorScore = Number(sim.toFixed(4));
          candidate.finalScore = Number((0.4 * candidate.keywordScore + 0.6 * candidate.vectorScore).toFixed(4));
        }
      } catch (_) {
        // Fallback to keyword score if embedding service unavailable
      }
    }

    scoredDoubts.sort((a, b) => b.finalScore - a.finalScore);
    const topMatch = scoredDoubts[0];

    if (!topMatch) {
      return { matchType: 'no_match', matchingDoubts: [] };
    }

    const matchType = classifyDoubtSimilarity(topMatch.keywordScore, topMatch.vectorScore);

    const matchingDoubts = scoredDoubts
      .filter((s) => s.finalScore >= 0.4)
      .slice(0, 5)
      .map((s) => ({
        _id: s.doubt._id,
        text: s.doubt.text,
        topic: s.doubt.topic,
        upvoteCount: s.doubt.upvoteCount,
        similarityScore: s.finalScore,
      }));

    return {
      matchType,
      topMatchScore: topMatch.finalScore,
      matchingDoubts,
    };
  }
}
