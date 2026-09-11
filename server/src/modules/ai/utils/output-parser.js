/**
 * Safely parses JSON output from LLM responses, cleaning markdown fences (```json ... ```).
 */
export const parseStructuredJson = (rawText = '', fallback = {}) => {
  if (!rawText || typeof rawText !== 'string') return fallback;

  try {
    // Strip markdown code fences if present
    let cleaned = rawText.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt match regex for JSON object or array
    const jsonMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (_) {}
    }
    return fallback;
  }
};
