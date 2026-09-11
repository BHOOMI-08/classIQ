import mongoose from 'mongoose';

const quizProcessingJobSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null, index: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', default: null },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', default: null },
    jobType: {
      type: String,
      enum: [
        'publish_scheduled_quiz', 'activate_quiz', 'close_quiz',
        'auto_submit_attempt', 'grade_attempt', 'finalize_manual_review',
        'release_results', 'generate_ai_quiz', 'generate_ai_explanations',
        'recalculate_quiz_analytics', 'export_quiz_results', 'generate_practice_quiz',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    scheduledFor: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lockedAt: { type: Date, default: null },
    lockedBy: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    lastErrorCode: { type: String, default: null },
    lastErrorMessage: { type: String, default: null },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

quizProcessingJobSchema.index({ status: 1, scheduledFor: 1 });
quizProcessingJobSchema.index({ quizId: 1, jobType: 1, status: 1 });

export const QuizProcessingJob = mongoose.model('QuizProcessingJob', quizProcessingJobSchema);
