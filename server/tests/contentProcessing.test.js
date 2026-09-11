import { TextExtractionService } from '../src/modules/content/services/textExtraction.service.js';
import { TextCleaningService } from '../src/modules/content/services/textCleaning.service.js';
import { TextChunkingService } from '../src/modules/content/services/textChunking.service.js';
import { EmbeddingService } from '../src/modules/content/services/embedding.service.js';

describe('Module 4 — RAG Extraction, Chunking & Embedding Pipeline', () => {
  test('TextExtractionService extracts text notes and generates checksum', async () => {
    const rawNote = '# Unit 1 Notes\nThis is a sample academic note on vector calculus.';
    const result = await TextExtractionService.extractText({
      sourceType: 'text_note',
      textContent: rawNote,
    });

    expect(result.text).toBe(rawNote);
    expect(result.pageCount).toBe(1);
    expect(result.checksum).toBeDefined();
    expect(typeof result.checksum).toBe('string');
  });

  test('TextCleaningService normalizes whitespace and removes control characters', () => {
    const dirtyText = "Header Line\r\n\r\n\0Some   text   with   spaces.\n\n\nPage 1\nFinal line.";
    const result = TextCleaningService.cleanText(dirtyText);

    expect(result.cleanedText).not.toContain('\0');
    expect(result.cleanedText).not.toContain('Page 1');
    expect(result.cleanedText).toContain('Some text with spaces.');
  });

  test('TextChunkingService creates semantic chunks with heading metadata', () => {
    const academicText = `# Chapter 1: Differential Equations
An ordinary differential equation is a differential equation containing one or more functions of one independent variable.

# Chapter 2: Partial Differential Equations
A partial differential equation is an equation which contains unknown multivariable functions and their partial derivatives.`;

    const chunks = TextChunkingService.chunkText(academicText, {
      topic: 'Calculus',
      unit: 'Unit 2',
      maxChunkChars: 150,
      overlapChars: 30,
    });

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].sectionTitle).toBeDefined();
    expect(chunks[0].checksum).toBeDefined();
    expect(chunks[0].topic).toBe('Calculus');
  });

  test('EmbeddingService generates 768-dimensional normalized unit vectors', async () => {
    const text = 'Vector calculus and linear algebra fundamental principles.';
    const vector = await EmbeddingService.generateEmbedding(text);

    expect(Array.isArray(vector)).toBe(true);
    expect(vector.length).toBe(768);

    // Verify vector magnitude is normalized (~1.0)
    const norm = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
    expect(norm).toBeCloseTo(1.0, 1);
  });

  test('EmbeddingService computes cosine similarity correctly', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];

    expect(EmbeddingService.cosineSimilarity(vecA, vecB)).toBe(1.0);
    expect(EmbeddingService.cosineSimilarity(vecA, vecC)).toBe(0.0);
  });
});
