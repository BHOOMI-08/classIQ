import { z } from 'zod';
import { ContentChunk } from '../../content/models/contentChunk.model.js';
import { ContentResource } from '../../content/models/contentResource.model.js';
import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import { ApiError } from '../../../utils/api-error.js';

// Zod Schema for structured AI Assignment Output
const assignmentOutputSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  instructions: z.string().min(10),
  learningOutcomes: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  totalMarks: z.number().min(1),
  tasks: z.array(
    z.object({
      taskNumber: z.number(),
      title: z.string(),
      prompt: z.string(),
      marks: z.number(),
    })
  ),
  rubricSuggestion: z
    .object({
      criteria: z.array(
        z.object({
          title: z.string(),
          maximumMarks: z.number(),
          description: z.string().optional(),
        })
      ),
    })
    .optional(),
});

export class AssignmentAIService {
  /**
   * Generate an assignment using Topic or Module 4 RAG Grounded Context.
   */
  static async generateAssignment({ classroomId, resourceIds, topic, unit, difficulty, totalMarks = 50, assignmentType = 'homework' }) {
    let retrievedContext = '';
    let sourceResourceTitles = [];

    // Mode 2: RAG Grounding using Module 4 Content Chunks
    if (Array.isArray(resourceIds) && resourceIds.length > 0) {
      const resources = await ContentResource.find({ _id: { $in: resourceIds }, classroomId }).lean();
      sourceResourceTitles = resources.map((r) => r.title);

      const chunks = await ContentChunk.find({
        resourceId: { $in: resourceIds },
        isActive: true,
      })
        .limit(8)
        .lean();

      if (chunks.length > 0) {
        retrievedContext = chunks.map((c, i) => `[Chunk ${i + 1} - ${c.sectionTitle}]: ${c.text}`).join('\n\n');
      }
    }

    const prompt = `You are an expert university professor creating an academic assignment.
Topic: ${topic || 'General Course Material'}
Unit: ${unit || 'Unit 1'}
Difficulty: ${difficulty || 'medium'}
Assignment Type: ${assignmentType}
Total Marks Target: ${totalMarks}

${retrievedContext ? `GROUNDING COURSE MATERIAL:\n${retrievedContext}\n` : ''}

Generate a structured assignment output in JSON matching this exact structure:
{
  "title": "Assignment Title",
  "description": "Short overview",
  "instructions": "Step-by-step student instructions...",
  "learningOutcomes": ["Outcome 1", "Outcome 2"],
  "difficulty": "${difficulty || 'medium'}",
  "totalMarks": ${totalMarks},
  "tasks": [
    { "taskNumber": 1, "title": "Task 1 Name", "prompt": "Task prompt...", "marks": ${Math.floor(totalMarks / 2)} },
    { "taskNumber": 2, "title": "Task 2 Name", "prompt": "Task prompt...", "marks": ${Math.ceil(totalMarks / 2)} }
  ],
  "rubricSuggestion": {
    "criteria": [
      { "title": "Conceptual Understanding", "maximumMarks": ${Math.floor(totalMarks / 2)}, "description": "Clarity of theory" },
      { "title": "Problem Solving & Execution", "maximumMarks": ${Math.ceil(totalMarks / 2)}, "description": "Accuracy of results" }
    ]
  }
}
Output MUST be raw JSON without markdown formatting.`;

    let generatedData = null;

    try {
      if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'placeholder_key') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const resJson = await response.json();
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          generatedData = JSON.parse(cleanedText);
        }
      }
    } catch (err) {
      logger.warn('Gemini API call failed, using deterministic assignment generator fallback:', { error: err.message });
    }

    // Fallback if API unavailable or parsing fails
    if (!generatedData) {
      const task1Marks = Math.floor(totalMarks / 2);
      const task2Marks = totalMarks - task1Marks;
      generatedData = {
        title: `${topic || 'Academic'} Comprehensive ${assignmentType.toUpperCase()} Assignment`,
        description: `RAG-grounded academic assessment on ${topic || 'Core Course Concepts'} under ${unit || 'Unit 1'}.`,
        instructions: `1. Read the grounding course materials carefully.\n2. Complete all tasks showing full analytical steps.\n3. Upload your final solution in PDF format before the due date.`,
        learningOutcomes: [
          `Master core theoretical principles of ${topic || 'the subject'}.`,
          `Apply problem-solving methods to complex scenarios.`,
        ],
        difficulty: difficulty || 'medium',
        totalMarks,
        tasks: [
          {
            taskNumber: 1,
            title: `Theoretical Principles of ${topic || 'Unit 1'}`,
            prompt: `Explain the fundamental derivations and governing principles discussed in ${sourceResourceTitles[0] || 'the lecture notes'}.`,
            marks: task1Marks,
          },
          {
            taskNumber: 2,
            title: `Practical Application & Problem Solving`,
            prompt: `Solve the given analytical problem scenario and validate your boundary conditions step-by-step.`,
            marks: task2Marks,
          },
        ],
        rubricSuggestion: {
          criteria: [
            { title: 'Theoretical Rigor & Accuracy', maximumMarks: task1Marks, description: 'Correct application of formulas and concepts.' },
            { title: 'Analytical Execution', maximumMarks: task2Marks, description: 'Step-by-step correctness of calculations.' },
          ],
        },
      };
    }

    // Validate generated output using Zod
    const validatedOutput = assignmentOutputSchema.parse(generatedData);
    return {
      ...validatedOutput,
      groundedResources: sourceResourceTitles,
    };
  }
}
