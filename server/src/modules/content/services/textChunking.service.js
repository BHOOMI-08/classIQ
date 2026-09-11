import crypto from 'crypto';

export class TextChunkingService {
  /**
   * Chunk text into semantic sections with overlap and metadata.
   * Target chunk size: ~500 - 800 tokens (~2000 - 3200 chars)
   * Target overlap: ~80 - 150 tokens (~320 - 600 chars)
   */
  static chunkText(text, options = {}) {
    const {
      maxChunkChars = 2500,
      overlapChars = 400,
      topic = 'General',
      unit = 'Unit 1',
    } = options;

    if (!text || text.trim().length === 0) {
      return [];
    }

    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const chunks = [];
    let currentChunkText = '';
    let currentSectionTitle = 'General Section';
    let chunkIndex = 0;
    let currentPage = 1;

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();

      // Detect heading
      if (/^#{1,6}\s+|^[A-Z0-9\.\s]{3,40}:$/.test(trimmed)) {
        currentSectionTitle = trimmed.replace(/^#{1,6}\s+/, '').trim();
      }

      if ((currentChunkText + '\n\n' + trimmed).length > maxChunkChars && currentChunkText.length > 0) {
        // Finalize chunk
        chunks.push(
          this.createChunkObject({
            chunkIndex,
            text: currentChunkText.trim(),
            sectionTitle: currentSectionTitle,
            pageNumber: currentPage,
            topic,
            unit,
          })
        );
        chunkIndex++;

        // Apply overlap from end of previous chunk
        const overlapStart = Math.max(0, currentChunkText.length - overlapChars);
        currentChunkText = currentChunkText.substring(overlapStart) + '\n\n' + trimmed;
        currentPage = Math.floor(chunkIndex / 3) + 1;
      } else {
        currentChunkText = currentChunkText ? currentChunkText + '\n\n' + trimmed : trimmed;
      }
    }

    if (currentChunkText.trim().length > 0) {
      chunks.push(
        this.createChunkObject({
          chunkIndex,
          text: currentChunkText.trim(),
          sectionTitle: currentSectionTitle,
          pageNumber: currentPage,
          topic,
          unit,
        })
      );
    }

    return chunks;
  }

  static createChunkObject({ chunkIndex, text, sectionTitle, pageNumber, topic, unit }) {
    const normalizedText = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const wordCount = text.split(/\s+/).length;
    const tokenEstimate = Math.ceil(wordCount * 1.3);

    return {
      chunkIndex,
      text,
      normalizedText,
      tokenEstimate,
      characterCount: text.length,
      pageNumber,
      sectionTitle,
      topic,
      unit,
      checksum: crypto.createHash('sha256').update(text).digest('hex'),
    };
  }
}
