import mongoose from 'mongoose';

const questionScoreSchema = new mongoose.Schema(
  {
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult', required: true, index: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
    attemptQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttemptQuestion', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    topic: { type: String, default: '' },

    marksAvailable: { type: Number, required: true },
    marksAwarded: { type: Number, default: 0 },
    negativeMarksApplied: { type: Number, default: 0 },

    gradingMode: { type: String, enum: ['automatic', 'manual', 'assisted'], default: 'automatic' },
    correctness: {
      type: String,
      enum: ['correct', 'incorrect', 'partially_correct', 'unanswered', 'pending_review'],
      default: 'pending_review',
    },

    selectedOptionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    matchedAnswer: { type: String, default: null },

    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewerFeedback: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

questionScoreSchema.index({ resultId: 1, topic: 1 });
questionScoreSchema.index({ attemptId: 1, questionId: 1 });

export const QuestionScore = mongoose.model('QuestionScore', questionScoreSchema);
