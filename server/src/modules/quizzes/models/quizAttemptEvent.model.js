import mongoose from 'mongoose';

const quizAttemptEventSchema = new mongoose.Schema(
  {
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: {
      type: String,
      enum: [
        'attempt_created', 'attempt_started', 'question_viewed', 'answer_saved', 'question_flagged',
        'reconnect_started', 'reconnect_completed', 'tab_hidden', 'tab_visible',
        'fullscreen_entered', 'fullscreen_exited', 'connection_lost', 'connection_restored',
        'manual_submit', 'auto_submit', 'attempt_expired', 'attempt_invalidated',
      ],
      required: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    clientTimestamp: { type: Date, default: null },
    serverTimestamp: { type: Date, default: Date.now },
    requestId: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

quizAttemptEventSchema.index({ attemptId: 1, serverTimestamp: 1 });
quizAttemptEventSchema.index({ attemptId: 1, eventType: 1 });

export const QuizAttemptEvent = mongoose.model('QuizAttemptEvent', quizAttemptEventSchema);
