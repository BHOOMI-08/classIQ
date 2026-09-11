/**
 * Estimates token count for text strings (approx 4 chars per token for English).
 */
export const estimateTokenCount = (text = '') => {
  if (typeof text !== 'string') return 0;
  return Math.ceil(text.trim().length / 4);
};

/**
 * Truncate text to fit within a max token budget.
 */
export const truncateToTokenBudget = (text = '', maxTokens = 1000) => {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '... [truncated context]';
};
