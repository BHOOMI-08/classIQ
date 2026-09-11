export const AI_FEATURES = {
  TUTOR: 'ai_tutor',
  LECTURE_PLANNER: 'lecture_planner',
  ANNOUNCEMENT_WRITER: 'announcement_writer',
  CLASS_SUMMARY: 'class_summary',
  STUDY_PLANNER: 'study_planner',
  WEAKNESS_MAP: 'weakness_map',
  REVISION_GENERATOR: 'revision_generator',
  QUIZ_EXPLANATION: 'quiz_explanation',
};

export const AI_FEATURE_CONFIGS = {
  [AI_FEATURES.TUTOR]: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: 0.2,
    maxTokens: 1024,
    groundingRequired: true,
    citationsRequired: true,
    cacheable: false,
  },
  [AI_FEATURES.LECTURE_PLANNER]: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: 0.4,
    maxTokens: 2048,
    groundingRequired: false,
    citationsRequired: true,
    cacheable: true,
  },
  [AI_FEATURES.ANNOUNCEMENT_WRITER]: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: 0.6,
    maxTokens: 1024,
    groundingRequired: false,
    citationsRequired: false,
    cacheable: false,
  },
  [AI_FEATURES.CLASS_SUMMARY]: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: 0.3,
    maxTokens: 1500,
    groundingRequired: false,
    citationsRequired: false,
    cacheable: true,
  },
  [AI_FEATURES.STUDY_PLANNER]: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: 0.3,
    maxTokens: 2048,
    structuredJson: true,
    groundingRequired: false,
    citationsRequired: false,
    cacheable: false,
  },
  [AI_FEATURES.WEAKNESS_MAP]: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: 0.2,
    maxTokens: 1500,
    groundingRequired: false,
    citationsRequired: false,
    cacheable: true,
  },
  [AI_FEATURES.REVISION_GENERATOR]: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: 0.4,
    maxTokens: 2048,
    groundingRequired: true,
    citationsRequired: true,
    cacheable: true,
  },
  [AI_FEATURES.QUIZ_EXPLANATION]: {
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: 0.3,
    maxTokens: 1024,
    groundingRequired: true,
    citationsRequired: true,
    cacheable: true,
  },
};

export const DEFAULT_AI_QUOTAS = {
  DAILY_USER_LIMIT: parseInt(process.env.AI_DAILY_USER_LIMIT || '50', 10),
  DAILY_CLASS_LIMIT: parseInt(process.env.AI_DAILY_CLASS_LIMIT || '500', 10),
  CACHE_TTL_SECONDS: parseInt(process.env.AI_CACHE_TTL_SECONDS || '3600', 10),
};

export const INSUFFICIENT_CONTEXT_MESSAGE =
  'The available classroom resources do not contain enough information to answer this confidently. Try selecting another resource or ask your teacher.';
