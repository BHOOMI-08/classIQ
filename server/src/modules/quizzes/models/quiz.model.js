import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentModule', default: null },

    title: { type: String, required: true, trim: true, maxlength: 300 },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: '', maxlength: 2000 },
    instructions: [{ type: String }],
    learningOutcomes: [{ type: String }],
    topic: { type: String, default: '' },
    unit: { type: String, default: '' },
    tags: [{ type: String }],

    quizType: {
      type: String,
      enum: ['practice', 'graded', 'diagnostic', 'revision', 'mock_exam', 'formative', 'summative'],
      default: 'graded',
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' },

    totalMarks: { type: Number, required: true, min: 1 },
    passingMarks: { type: Number, default: 0 },
    durationMinutes: { type: Number, required: true, min: 1, max: 600 },

    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'active', 'closed', 'cancelled', 'archived'],
      default: 'draft',
      index: true,
    },

    scheduledPublishAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    openingAt: { type: Date, default: null },
    closingAt: { type: Date, default: null },
    timezone: { type: String, default: 'UTC' },

    attemptLimit: { type: Number, default: 1, min: 1 },
    allowResume: { type: Boolean, default: true },
    allowLateStart: { type: Boolean, default: false },
    forceSubmitAtClosing: { type: Boolean, default: true },
    autoSubmitOnTimeout: { type: Boolean, default: true },

    randomizeQuestions: { type: Boolean, default: false },
    randomizeOptions: { type: Boolean, default: false },
    questionSelectionMode: {
      type: String,
      enum: ['fixed', 'random_subset', 'topic_balanced', 'difficulty_balanced'],
      default: 'fixed',
    },
    questionsPerAttempt: { type: Number, default: null },

    resultReleaseMode: {
      type: String,
      enum: ['immediate', 'after_submission_window', 'after_manual_review', 'teacher_release'],
      default: 'immediate',
    },
    answerReviewPolicy: {
      type: String,
      enum: ['no_review', 'score_only', 'explanations_only', 'answers_and_explanations', 'full_review'],
      default: 'score_only',
    },
    showCorrectAnswers: { type: Boolean, default: false },
    showExplanations: { type: Boolean, default: true },
    showTopicPerformance: { type: Boolean, default: true },

    negativeMarkingEnabled: { type: Boolean, default: false },
    defaultNegativeMarks: { type: Number, default: 0, min: 0 },
    partialMarkingEnabled: { type: Boolean, default: false },

    requireFullscreen: { type: Boolean, default: false },
    tabSwitchMonitoringEnabled: { type: Boolean, default: false },

    aiGenerated: { type: Boolean, default: false },
    aiGenerationMetadata: { type: mongoose.Schema.Types.Mixed, default: null },

    // Aggregate stats (derived, updated by analytics worker)
    totalQuestions: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    completedAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: null },

    archivedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

quizSchema.index({ classroomId: 1, status: 1, openingAt: 1 });
quizSchema.index({ classroomId: 1, closingAt: 1 });
quizSchema.index({ classroomId: 1, slug: 1 }, { unique: true });
quizSchema.index({ status: 1, scheduledPublishAt: 1 });
quizSchema.index({ status: 1, closingAt: 1 });
quizSchema.index({ classroomId: 1, topic: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
