import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import { ContentChunk } from '../../content/models/contentChunk.model.js';

export class AIExplanationService {
  /**
   * Generate AI explanation for a question after result release.
   * Grounded in Module 4 chunks where available.
   */
  static async generateExplanation({ question, studentAnswer, correctAnswer, topic, teacherExplanation, sourceChunkIds = [] }) {
    let ragContext = '';
    if (sourceChunkIds.length > 0) {
      const chunks = await ContentChunk.find({ _id: { $in: sourceChunkIds }, isActive: true }).limit(3).lean();
      ragContext = chunks.map((c) => `[From: ${c.sectionTitle || 'Study Material'}]: ${c.text.slice(0, 400)}`).join('\n\n');
    }

    const prompt = `You are a helpful academic tutor providing feedback to a student after a quiz.

Question: ${question}
Topic: ${topic || 'General'}
Student's Answer: ${JSON.stringify(studentAnswer)}
Correct Answer: ${JSON.stringify(correctAnswer)}
${teacherExplanation ? `Teacher's Explanation: ${teacherExplanation}` : ''}
${ragContext ? `\nRelevant Study Material:\n${ragContext}` : ''}

Provide a constructive explanation in JSON format:
{
  "whyCorrectIsCorrect": "Explain why the correct answer is right in 2-3 sentences",
  "whyStudentWasWrong": "Explain gently why the student's answer was incorrect (only if wrong)",
  "keyConcept": "The core concept tested",
  "revisionTip": "A 1-sentence study tip for the student",
  "sourceReferences": ["Reference to study material if applicable"]
}

Output ONLY raw JSON.`;

    try {
      if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'placeholder_key') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );

        if (response.ok) {
          const resJson = await response.json();
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanedText);
        }
      }
    } catch (err) {
      logger.warn('AI explanation generation failed:', err.message);
    }

    // Fallback
    return {
      whyCorrectIsCorrect: teacherExplanation || `The correct answer is based on fundamental principles of ${topic || 'this topic'}.`,
      whyStudentWasWrong: 'Review the concept in your study materials.',
      keyConcept: topic || 'Core concept',
      revisionTip: `Revisit the study material on ${topic || 'this topic'} for better understanding.`,
      sourceReferences: [],
    };
  }
}
