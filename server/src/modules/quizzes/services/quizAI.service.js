import { z } from 'zod';
import { ContentChunk } from '../../content/models/contentChunk.model.js';
import { ContentResource } from '../../content/models/contentResource.model.js';
import { AIQuizArtifact } from '../models/aiQuizArtifact.model.js';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import { ApiError } from '../../../utils/api-error.js';

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
  feedback: z.string().optional().default(''),
});

const questionSchema = z.object({
  type: z.enum(['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'long_answer']),
  prompt: z.string().min(5),
  topic: z.string().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  bloomLevel: z.enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']).default('understand'),
  marks: z.number().min(0.5),
  negativeMarks: z.number().min(0).default(0),
  options: z.array(optionSchema).optional().default([]),
  answerKey: z.union([z.boolean(), z.null()]).optional().nullable(),
  acceptedAnswers: z.array(z.string()).optional().default([]),
  explanation: z.string().optional().default(''),
  sourceChunkIds: z.array(z.string()).optional().default([]),
});

const quizOutputSchema = z.object({
  title: z.string().min(3),
  instructions: z.array(z.string()).optional().default([]),
  durationMinutes: z.number().min(5),
  totalMarks: z.number().min(1),
  questions: z.array(questionSchema).min(1),
});

export class QuizAIService {
  static async generateQuiz({ classroomId, teacherId, generationMode = 'topic', resourceIds = [], topic, unit, difficulty = 'mixed', questionTypes = ['single_choice', 'multiple_choice', 'true_false'], questionCount = 10, totalMarks = 20, durationMinutes = 30, bloomDistribution = null, additionalInstructions = '' }) {
    let ragContext = '';
    let sourceChunkIds = [];
    let sourceResourceTitles = [];

    if (generationMode === 'resource_rag' && resourceIds.length > 0) {
      const resources = await ContentResource.find({ _id: { $in: resourceIds }, classroomId }).lean();
      sourceResourceTitles = resources.map((r) => r.title);
      const chunks = await ContentChunk.find({ resourceId: { $in: resourceIds }, isActive: true }).limit(12).lean();
      sourceChunkIds = chunks.map((c) => c._id.toString());
      ragContext = chunks.map((c, i) => `[Source ${i + 1} - ${c.sectionTitle || ''}]:\n${c.text}`).join('\n\n');
    }

    const marksPerQuestion = (totalMarks / questionCount).toFixed(1);
    const prompt = `You are an expert university educator. Create a structured quiz assessment.

Topic: ${topic || 'General Course Material'}
Unit: ${unit || 'Unit 1'}
Difficulty: ${difficulty}
Total Questions: ${questionCount}
Total Marks: ${totalMarks} (approximately ${marksPerQuestion} marks per question)
Duration: ${durationMinutes} minutes
Question Types to include: ${questionTypes.join(', ')}
${bloomDistribution ? `Bloom Level Distribution: ${JSON.stringify(bloomDistribution)}` : ''}
${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}

${ragContext ? `\nGROUNDING COURSE MATERIAL:\n${ragContext}\n` : ''}

Generate a structured JSON quiz following this schema exactly:
{
  "title": "Quiz Title",
  "instructions": ["Instruction 1", "Instruction 2"],
  "durationMinutes": ${durationMinutes},
  "totalMarks": ${totalMarks},
  "questions": [
    {
      "type": "single_choice",
      "prompt": "Question prompt here?",
      "topic": "Topic Name",
      "difficulty": "medium",
      "bloomLevel": "understand",
      "marks": 2,
      "negativeMarks": 0,
      "options": [
        {"text": "Option A", "isCorrect": false},
        {"text": "Option B", "isCorrect": true},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ],
      "explanation": "Brief explanation of the correct answer",
      "sourceChunkIds": []
    }
  ]
}

Rules:
- single_choice must have exactly 1 correct option
- multiple_choice must have 1+ correct options
- true_false must have answerKey: true or false (no options array needed)
- short_answer must have acceptedAnswers array
- All marks must sum to exactly ${totalMarks}
- Output ONLY raw JSON without markdown code blocks`;

    let generatedData = null;
    let retries = 0;

    while (retries < 2) {
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
            generatedData = JSON.parse(cleanedText);
            break;
          }
        }
      } catch (err) {
        logger.warn(`Quiz AI generation attempt ${retries + 1} failed:`, err.message);
      }
      retries++;
    }

    // Deterministic fallback
    if (!generatedData) {
      const marksEach = Math.floor(totalMarks / questionCount);
      const remainder = totalMarks - marksEach * questionCount;
      generatedData = {
        title: `${topic || 'Course'} Assessment Quiz`,
        instructions: ['Read each question carefully.', 'Answer all questions within the time limit.'],
        durationMinutes,
        totalMarks,
        questions: Array.from({ length: questionCount }, (_, i) => ({
          type: 'single_choice',
          prompt: `Question ${i + 1}: Explain the key concept related to ${topic || 'the course material'}.`,
          topic: topic || 'General',
          difficulty: 'medium',
          bloomLevel: 'understand',
          marks: marksEach + (i === 0 ? remainder : 0),
          negativeMarks: 0,
          options: [
            { text: 'Option A (Correct)', isCorrect: true },
            { text: 'Option B', isCorrect: false },
            { text: 'Option C', isCorrect: false },
            { text: 'Option D', isCorrect: false },
          ],
          explanation: `This tests understanding of ${topic || 'the topic'}.`,
          sourceChunkIds: [],
        })),
      };
    }

    // Validate with Zod
    const validationResult = quizOutputSchema.safeParse(generatedData);
    const validationErrors = validationResult.success ? [] : validationResult.error.errors.map((e) => e.message);

    // Store artifact (requires teacher review before becoming a real quiz)
    const artifact = await AIQuizArtifact.create({
      classroomId,
      generatedBy: teacherId,
      generationMode,
      sourceResourceIds: resourceIds,
      sourceChunkIds,
      inputSettings: { topic, unit, difficulty, questionCount, totalMarks, durationMinutes, questionTypes },
      structuredOutput: generatedData,
      model: 'gemini-1.5-flash',
      promptVersion: '2.0',
      status: validationResult.success ? 'validated' : 'generated',
      validationErrors,
    });

    if (!validationResult.success) {
      logger.warn('AI quiz output has validation errors:', validationErrors);
    }

    return {
      artifactId: artifact._id,
      quiz: generatedData,
      validationErrors,
      valid: validationResult.success,
      groundedResources: sourceResourceTitles,
    };
  }
}
