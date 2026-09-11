import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const tutorConversationSchema = z.object({
  classroomId: objectIdSchema,
  title: z.string().max(100).optional(),
});

export const tutorMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  selectedResourceIds: z.array(objectIdSchema).optional(),
});

export const tutorFeedbackSchema = z.object({
  rating: z.enum(['helpful', 'unhelpful']),
  comment: z.string().max(500).optional(),
});

export const lecturePlannerSchema = z.object({
  classroomId: objectIdSchema,
  topic: z.string().min(2).max(200),
  learningOutcomes: z.array(z.string()).optional(),
  lectureDurationMinutes: z.number().int().min(15).max(300).default(60),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  teachingStyle: z.enum(['interactive', 'lecture', 'problem_solving', 'discussion']).default('interactive'),
  selectedResourceIds: z.array(objectIdSchema).optional(),
  allowGeneralFallback: z.boolean().default(false),
  includeActivity: z.boolean().default(true),
  includeAssessment: z.boolean().default(true),
  includeHomework: z.boolean().default(true),
});

export const announcementWriterSchema = z.object({
  classroomId: objectIdSchema,
  prompt: z.string().min(5).max(1000),
  audience: z.enum(['all_students', 'struggling_students', 'parents', 'teachers']).default('all_students'),
  tone: z.enum(['professional', 'friendly', 'urgent', 'encouraging', 'formal']).default('professional'),
  dueDate: z.string().optional(),
});

export const classSummarySchema = z.object({
  classroomId: objectIdSchema,
});

export const studyPlanGenerateSchema = z.object({
  classroomIds: z.array(objectIdSchema).min(1, 'Select at least one classroom'),
  examDates: z.array(z.object({
    subject: z.string(),
    date: z.string(),
  })).optional(),
  dailyAvailableMinutes: z.number().int().min(30).max(1440).default(120),
  preferredStudyWindows: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).optional(),
  restDays: z.array(z.number().int().min(0).max(6)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const revisionGenerateSchema = z.object({
  classroomId: objectIdSchema,
  resourceIds: z.array(objectIdSchema).optional(),
  topic: z.string().max(200).optional(),
  revisionType: z.enum([
    'flashcards',
    'one_page_summary',
    'formula_sheet',
    'important_questions',
    'topic_checklist',
    'revision_quiz',
    'concept_comparison',
    'common_mistakes',
  ]),
});

export const quizExplanationSchema = z.object({
  quizId: objectIdSchema,
  attemptId: objectIdSchema,
  scoreId: objectIdSchema,
});
