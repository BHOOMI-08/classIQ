export class TextCleaningService {
  /**
   * Deterministic academic text cleaning pipeline.
   */
  static cleanText(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return {
        cleanedText: '',
        removedPercentage: 0,
        characterCount: 0,
        wordCount: 0,
      };
    }

    const originalLength = rawText.length;

    let text = rawText
      .replace(/\0/g, '') // remove null bytes
      .replace(/\r\n/g, '\n') // normalize line endings
      .replace(/[ \t]+/g, ' ') // condense horizontal whitespace
      .replace(/\n{3,}/g, '\n\n') // max 2 consecutive newlines
      .trim();

    // Preserve headings & bullet formatting
    const lines = text.split('\n').map((line) => line.trim());
    const cleanedLines = lines.filter((line) => {
      // Remove page-only lines like "Page 1", "- 1 -"
      if (/^(page|\-)?\s*\d+\s*(\-)?$/i.test(line)) return false;
      return true;
    });

    const cleanedText = cleanedLines.join('\n');
    const cleanedLength = cleanedText.length;
    const removedPercentage = originalLength > 0
      ? Number((((originalLength - cleanedLength) / originalLength) * 100).toFixed(2))
      : 0;

    return {
      cleanedText,
      removedPercentage,
      characterCount: cleanedLength,
      wordCount: cleanedText ? cleanedText.split(/\s+/).length : 0,
    };
  }
}
