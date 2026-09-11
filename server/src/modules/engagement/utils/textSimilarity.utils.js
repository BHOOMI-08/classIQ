/**
 * Text Similarity & Deduplication Utilities for ClassIQ Anonymous Doubts
 */

export function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compute Jaccard Similarity between two text strings (Token / Keyword level)
 */
export function calculateKeywordSimilarity(textA = '', textB = '') {
  const normA = normalizeText(textA);
  const normB = normalizeText(textB);

  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;

  const setA = new Set(normA.split(' ').filter((w) => w.length > 2));
  const setB = new Set(normB.split(' ').filter((w) => w.length > 2));

  if (setA.size === 0 || setB.size === 0) return 0;

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return Number((intersection.size / union.size).toFixed(4));
}

/**
 * Classify similarity outcome
 */
export function classifyDoubtSimilarity(keywordScore = 0, vectorScore = 0) {
  const maxScore = Math.max(keywordScore, vectorScore);
  if (maxScore >= 0.75) return 'strong_match';
  if (maxScore >= 0.45) return 'possible_match';
  return 'no_match';
}
