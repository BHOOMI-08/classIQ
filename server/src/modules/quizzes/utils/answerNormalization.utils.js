/**
 * Normalize a text answer for comparison.
 */

export function normalizeText(text = '') {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Exact match (case-sensitive, whitespace trimmed).
 */
export function exactMatch(studentAnswer, acceptedAnswer) {
  return studentAnswer.trim() === acceptedAnswer.trim();
}

/**
 * Case-insensitive match.
 */
export function caseInsensitiveMatch(studentAnswer, acceptedAnswer) {
  return normalizeText(studentAnswer) === normalizeText(acceptedAnswer);
}

/**
 * Normalized match: strip punctuation, lowercase, normalize whitespace.
 */
export function normalizedMatch(studentAnswer, acceptedAnswer) {
  const clean = (s) => normalizeText(s).replace(/[^a-z0-9 ]/g, '');
  return clean(studentAnswer) === clean(acceptedAnswer);
}

/**
 * Keyword match: all required keywords must appear in student answer.
 */
export function keywordMatch(studentAnswer, keywords = []) {
  const lowerAnswer = normalizeText(studentAnswer);
  return keywords.every((kw) => lowerAnswer.includes(kw.trim().toLowerCase()));
}

/**
 * Run the appropriate matching strategy against all accepted answers.
 * Returns true if any accepted answer matches.
 */
export function matchAnswer(studentAnswer, acceptedAnswers = [], mode = 'manual') {
  if (!studentAnswer || acceptedAnswers.length === 0) return false;
  return acceptedAnswers.some((accepted) => {
    switch (mode) {
      case 'exact': return exactMatch(studentAnswer, accepted);
      case 'case_insensitive': return caseInsensitiveMatch(studentAnswer, accepted);
      case 'normalized': return normalizedMatch(studentAnswer, accepted);
      case 'keyword': return keywordMatch(studentAnswer, accepted.split(','));
      default: return false; // 'manual' requires human review
    }
  });
}
