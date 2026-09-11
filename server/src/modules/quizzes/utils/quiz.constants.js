// Quiz constants and enums
export const QUIZ_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived',
};

export const ATTEMPT_STATUS = {
  CREATED: 'created',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  RECONNECTING: 'reconnecting',
  SUBMITTED: 'submitted',
  AUTO_SUBMITTED: 'auto_submitted',
  EXPIRED: 'expired',
  ABANDONED: 'abandoned',
  UNDER_REVIEW: 'under_review',
  GRADED: 'graded',
  INVALIDATED: 'invalidated',
};

export const RESULT_STATUS = {
  PENDING: 'pending',
  AUTO_GRADED: 'auto_graded',
  MANUAL_REVIEW_REQUIRED: 'manual_review_required',
  FINALIZED: 'finalized',
  RELEASED: 'released',
  SUPERSEDED: 'superseded',
  WITHHELD: 'withheld',
};

export const QUESTION_TYPE = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  LONG_ANSWER: 'long_answer',
  CASE_BASED: 'case_based',
  CODING: 'coding',
};

export const ACTIVE_ATTEMPT_STATUSES = [ATTEMPT_STATUS.CREATED, ATTEMPT_STATUS.IN_PROGRESS, ATTEMPT_STATUS.RECONNECTING];
export const TERMINAL_ATTEMPT_STATUSES = [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_SUBMITTED, ATTEMPT_STATUS.EXPIRED, ATTEMPT_STATUS.ABANDONED, ATTEMPT_STATUS.INVALIDATED];
export const OBJECTIVE_QUESTION_TYPES = [QUESTION_TYPE.SINGLE_CHOICE, QUESTION_TYPE.MULTIPLE_CHOICE, QUESTION_TYPE.TRUE_FALSE];
export const SUBJECTIVE_QUESTION_TYPES = [QUESTION_TYPE.LONG_ANSWER, QUESTION_TYPE.CASE_BASED, QUESTION_TYPE.CODING];

export const ELIGIBILITY = {
  AVAILABLE: 'available',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'attempt_in_progress',
  COMPLETED: 'completed',
  EXHAUSTED: 'attempts_exhausted',
  CLOSED: 'closed',
  ACCESS_DENIED: 'access_denied',
};

export const GRADE_THRESHOLDS = [
  { label: 'A+', min: 90 },
  { label: 'A', min: 80 },
  { label: 'B', min: 70 },
  { label: 'C', min: 60 },
  { label: 'D', min: 50 },
  { label: 'F', min: 0 },
];
