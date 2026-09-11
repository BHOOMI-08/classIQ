import mongoose from 'mongoose';

const questionAnalyticsSnapshotSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    topic: { type: String, default: '' },
    difficulty: { type: String, default: 'medium' },

    totalResponses: { type: Number, default: 0 },
    correctResponses: { type: Number, default: 0 },
    incorrectResponses: { type: Number, default: 0 },
    partialResponses: { type: Number, default: 0 },
    unansweredResponses: { type: Number, default: 0 },

    accuracyPercentage: { type: Number, default: 0 },
    averageMarks: { type: Number, default: 0 },
    averageTimeSeconds: { type: Number, default: 0 },

    mostSelectedWrongOptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    optionDistribution: { type: mongoose.Schema.Types.Mixed, default: {} }, // {optionId: count}
    discriminationIndex: { type: Number, default: null },
    difficultyEffectiveness: { type: String, default: '' },
    misconceptionTags: [{ type: String }],

    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

questionAnalyticsSnapshotSchema.index({ quizId: 1, questionId: 1 }, { unique: true });

export const QuestionAnalyticsSnapshot = mongoose.model('QuestionAnalyticsSnapshot', questionAnalyticsSnapshotSchema);
