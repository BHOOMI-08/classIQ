import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    attemptNumber: { type: Number, required: true, min: 1 },

    status: {
      type: String,
      enum: ['created', 'in_progress', 'paused', 'reconnecting', 'submitted', 'auto_submitted', 'expired', 'abandoned', 'under_review', 'graded', 'invalidated'],
      default: 'created',
      index: true,
    },

    startedAt: { type: Date, default: null },
    effectiveStartAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    submittedAt: { type: Date, default: null },
    autoSubmittedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: null },

    serverTimeAtStart: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },
    remainingSecondsAtLastSave: { type: Number, default: null },

    // Server-generated ordering and selection (immutable after attempt creation)
    questionOrder: [{ type: mongoose.Schema.Types.ObjectId }], // ordered questionMap IDs
    optionOrders: { type: mongoose.Schema.Types.Mixed, default: {} }, // {questionId: [optionId, ...]}
    selectedQuestionIds: [{ type: mongoose.Schema.Types.ObjectId }],

    // Security
    attemptTokenHash: { type: String, required: true }, // SHA-256 of random token
    sessionNonce: { type: String, default: '' },
    submissionReceiptCode: { type: String, default: null },

    // Navigation state
    currentQuestionIndex: { type: Number, default: 0 },
    answeredCount: { type: Number, default: 0 },
    flaggedCount: { type: Number, default: 0 },
    autosaveVersion: { type: Number, default: 0 },

    // Reconnect + anti-cheating signals
    reconnectCount: { type: Number, default: 0 },
    tabSwitchCount: { type: Number, default: 0 },
    fullscreenExitCount: { type: Number, default: 0 },
    suspiciousEventCount: { type: Number, default: 0 },

    // Resolved availability
    effectiveOpeningAt: { type: Date, default: null },
    effectiveClosingAt: { type: Date, default: null },
    accessGrantId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAccessGrant', default: null },
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult', default: null },
  },
  {
    timestamps: true,
  }
);

quizAttemptSchema.index({ quizId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
quizAttemptSchema.index({ quizId: 1, status: 1 });
quizAttemptSchema.index({ studentId: 1, status: 1, createdAt: -1 });
quizAttemptSchema.index({ expiresAt: 1, status: 1 });

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
