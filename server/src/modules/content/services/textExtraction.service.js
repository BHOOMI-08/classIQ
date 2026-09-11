import crypto from 'crypto';

export class TextExtractionService {
  /**
   * Extract text and metadata based on resource format.
   */
  static async extractText({ sourceType, buffer, textContent, externalUrl, description }) {
    if (sourceType === 'text_note') {
      const text = textContent || '';
      return {
        text,
        normalizedText: this.normalizeText(text),
        pageCount: 1,
        characterCount: text.length,
        wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
        checksum: crypto.createHash('sha256').update(text).digest('hex'),
        warnings: [],
      };
    }

    if (sourceType === 'external_link') {
      const text = `Link: ${externalUrl || ''}\nDescription: ${description || ''}`;
      return {
        text,
        normalizedText: this.normalizeText(text),
        pageCount: 1,
        characterCount: text.length,
        wordCount: text.trim().split(/\s+/).length,
        checksum: crypto.createHash('sha256').update(text).digest('hex'),
        warnings: [],
      };
    }

    // PDF / Document text extraction
    if (buffer) {
      const rawText = buffer.toString('utf8');

      // Detect plain text or markdown vs binary PDF structure
      const isPdfHeader = buffer.slice(0, 5).toString() === '%PDF-';
      
      let extracted = '';
      let pageCount = 1;
      let warnings = [];

      if (isPdfHeader) {
        // Simple PDF text stream extraction strategy (falls back gracefully)
        extracted = this.extractPdfTextStream(buffer);
        pageCount = (buffer.toString('binary').match(/\/Type\s*\/Page\b/g) || []).length || 1;
        if (!extracted || extracted.length < 50) {
          extracted = rawText.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').substring(0, 5000);
          warnings.push('PDF stream text extraction fell back to binary string parsing.');
        }
      } else {
        // Plain text, Markdown or WordDoc raw text
        extracted = rawText;
      }

      const cleanText = extracted.replace(/\0/g, '');
      const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

      return {
        text: cleanText,
        normalizedText: this.normalizeText(cleanText),
        pageCount,
        characterCount: cleanText.length,
        wordCount: cleanText.trim() ? cleanText.trim().split(/\s+/).length : 0,
        checksum,
        warnings,
      };
    }

    return {
      text: textContent || '',
      normalizedText: this.normalizeText(textContent || ''),
      pageCount: 1,
      characterCount: (textContent || '').length,
      wordCount: (textContent || '').trim().split(/\s+/).length,
      checksum: crypto.createHash('sha256').update(textContent || '').digest('hex'),
      warnings: [],
    };
  }

  static extractPdfTextStream(buffer) {
    const str = buffer.toString('latin1');
    const matches = str.match(/\((.*?)\)\s*Tj/g) || str.match(/\[(.*?)\]\s*TJ/g) || [];
    if (matches.length > 0) {
      return matches
        .map((m) => m.replace(/[\(\)\[\]]/g, '').replace(/Tj|TJ/g, ''))
        .join(' ');
    }
    return str.replace(/[^a-zA-Z0-9\s.,!?:;\-\n]/g, ' ');
  }

  static normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/\r\n/g, '\n')
      .replace(/[^\w\s\.\,\?\!\-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
