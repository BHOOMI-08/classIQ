import crypto from 'crypto';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

export class EmbeddingService {
  /**
   * Generate 768-dimensional vector embedding for text chunk.
   */
  static async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      return this.generateDeterministicVector('', 768);
    }

    try {
      if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'placeholder_key') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'models/text-embedding-004',
              content: { parts: [{ text: text.substring(0, 4000) }] },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.embedding?.values) {
            return data.embedding.values;
          }
        }
      }
    } catch (err) {
      logger.warn('Gemini embedding API request failed, using fallback vector:', { error: err.message });
    }

    // Fallback deterministic vector synthesis for local/test execution
    return this.generateDeterministicVector(text, 768);
  }

  /**
   * Batch embedding generation.
   */
  static async generateEmbeddings(texts) {
    const results = [];
    for (const text of texts) {
      const vector = await this.generateEmbedding(text);
      results.push(vector);
    }
    return results;
  }

  /**
   * Generate a normalized deterministic unit vector from text hash.
   */
  static generateDeterministicVector(text, dimension = 768) {
    const hash = crypto.createHash('sha256').update(text).digest();
    const vector = new Array(dimension);
    let normSq = 0;

    for (let i = 0; i < dimension; i++) {
      const byteVal = hash[i % hash.length];
      const val = Math.sin(byteVal * (i + 1)) * 2 - 1;
      vector[i] = val;
      normSq += val * val;
    }

    const norm = Math.sqrt(normSq) || 1;
    return vector.map((v) => Number((v / norm).toFixed(6)));
  }

  /**
   * Calculate cosine similarity between two vectors.
   */
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom ? dot / denom : 0;
  }
}
