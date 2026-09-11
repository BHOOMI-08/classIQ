export const PULSE_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
});

export const PULSE_OPTIONS = Object.freeze({
  CONFUSED: 'confused',
  PARTIALLY_CLEAR: 'partially_clear',
  CLEAR: 'clear',
  CAN_EXPLAIN: 'can_explain',
});

export const PULSE_OPTION_WEIGHTS = Object.freeze({
  confused: 0,
  partially_clear: 1,
  clear: 2,
  can_explain: 3,
});

export const PULSE_CONFIDENCE_LABELS = Object.freeze({
  HIGH_CONFUSION: 'high_confusion', // 0-34
  DEVELOPING: 'developing font',    // 35-59
  MOSTLY_CLEAR: 'mostly_clear',     // 60-79
  STRONG_CONFIDENCE: 'strong_confidence', // 80-100
});

export const POLL_TYPES = Object.freeze({
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  CONCEPT_CHECK: 'concept_check',
  OPINION: 'opinion',
  PREDICTION: 'prediction',
});

export const POLL_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
});

export const DOUBT_STATUS = Object.freeze({
  OPEN: 'open',
  GROUPED: 'grouped',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
  REJECTED: 'rejected',
});

export const DOUBT_CLUSTER_STATUS = Object.freeze({
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
});

export const EXIT_TICKET_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
});

export const EXIT_TICKET_ATTEMPT_STATUS = Object.freeze({
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  AUTO_GRADED: 'auto_graded',
  REVIEW_REQUIRED: 'review_required',
  GRADED: 'graded',
});

export const UNDERSTANDING_LEVELS = Object.freeze({
  STRONG: 'strong',            // >= 80%
  ACCEPTABLE: 'acceptable',    // 60-79%
  NEEDS_REVISION: 'needs_revision', // 40-59%
  CRITICAL: 'critical',        // < 40%
});

export const CONFUSION_LEVELS = Object.freeze({
  LOW: 'low',             // 0-25
  MODERATE: 'moderate',   // 26-50
  HIGH: 'high',           // 51-75
  CRITICAL: 'critical',   // 76-100
});

export const ACTIVITY_VISIBILITY = Object.freeze({
  TEACHER_ONLY: 'teacher_only',
  STUDENTS: 'students',
  ALL_MEMBERS: 'all_members',
});
