import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

export class AIEmbeddingService {
  static getApiKey() {
    return env.GEMINI_API_KEY || '';
  }

  /**
   * Generates a 768-dimensional embedding vector for input text.
   */
  static async generateEmbedding(text = '') {
    if (!text || !text.trim()) {
      return new Array(768).fill(0);
    }

    const apiKey = this.getApiKey();
    const model = env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${model}`,
          content: { parts: [{ text: text.slice(0, 2048) }] },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.embedding?.values && Array.isArray(data.embedding.values)) {
          return data.embedding.values;
        }
      }
    } catch (err) {
      logger.warn('AIEmbeddingService error, generating fallback vector:', { error: err.message });
    }

    // Deterministic fallback vector if API fails or offline
    return this.generateDeterministicFallbackVector(text);
  }

  static generateDeterministicFallbackVector(text) {
    const vector = new Array(768).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const idx = (charCode * 31 + i) % 768;
      vector[idx] += (charCode % 10) / 10;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((val) => val / magnitude);
  }

  static cosineSimilarity(vecA = [], vecB = []) {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
