import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const createPulseSchema = z.object({
  topic: z.string().max(150).optional(),
  prompt: z.string().min(5).max(300).default('How confident are you with this topic?'),
  durationMinutes: z.number().int().min(1).max(120).default(5),
  anonymous: z.boolean().default(true),
  allowResponseChange: z.boolean().default(true),
  showResultsToStudents: z.boolean().default(true),
});

export const respondPulseSchema = z.object({
  response: z.enum(['confused', 'partially_clear', 'clear', 'can_explain']),
});

export const createPollSchema = z.object({
  question: z.string().min(3).max(500),
  description: z.string().max(1000).optional(),
  type: z.enum(['single_choice', 'multiple_choice', 'true_false', 'concept_check', 'opinion', 'prediction']),
  topic: z.string().max(150).optional(),
  options: z.array(z.object({
    text: z.string().min(1).max(300),
    isCorrect: z.boolean().optional(),
    misconceptionTag: z.string().optional(),
  })).min(2, 'At least 2 options required'),
  durationMinutes: z.number().int().min(1).max(120).default(5),
  anonymous: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  allowResponseChange: z.boolean().default(false),
  showLiveResults: z.boolean().default(true),
  showCorrectAnswerAfterClose: z.boolean().default(true),
  explanation: z.string().max(1000).optional(),
});

export const respondPollSchema = z.object({
  selectedOptionIds: z.array(objectIdSchema).optional(),
  textResponse: z.string().max(1000).optional(),
});

export const submitDoubtSchema = z.object({
  topic: z.string().max(150).optional(),
  text: z.string().min(5, 'Doubt must be at least 5 characters').max(1000, 'Doubt text too long'),
  resourceId: objectIdSchema.optional(),
  anonymous: z.boolean().default(true),
});

export const resolveDoubtSchema = z.object({
  resolutionNote: z.string().max(1000).optional(),
});

export const createExitTicketSchema = z.object({
  title: z.string().min(3).max(200),
  topic: z.string().max(150).optional(),
  learningObjective: z.string().max(500).optional(),
  durationMinutes: z.number().int().min(1).max(60).default(5),
  showResultsToStudents: z.boolean().default(true),
  allowRetry: z.boolean().default(false),
  questions: z.array(z.object({
    type: z.enum(['single_choice', 'true_false', 'short_answer', 'confidence_scale']),
    prompt: z.string().min(3).max(500),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    acceptedAnswers: z.array(z.string()).optional(),
    marks: z.number().int().min(1).default(1),
    explanation: z.string().optional(),
  })).min(1, 'At least 1 question required'),
});

export const generateAIExitTicketSchema = z.object({
  topic: z.string().min(2).max(150),
  learningObjective: z.string().max(500).optional(),
  resourceIds: z.array(objectIdSchema).optional(),
  questionCount: z.number().int().min(2).max(5).default(3),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export const submitExitTicketSchema = z.object({
  answers: z.array(z.object({
    questionId: objectIdSchema,
    responseValue: z.string().min(1),
  })).min(1),
});
