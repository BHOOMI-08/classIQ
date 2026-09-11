import mongoose from 'mongoose';

const quizAnalyticsSnapshotSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },

    eligibleStudents: { type: Number, default: 0 },
    startedCount: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },

    averageScore: { type: Number, default: 0 },
    medianScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },

    averageTimeSeconds: { type: Number, default: 0 },
    averageQuestionsAnswered: { type: Number, default: 0 },
    lateStartCount: { type: Number, default: 0 },
    autoSubmitCount: { type: Number, default: 0 },
    manualReviewPendingCount: { type: Number, default: 0 },

    scoreDistribution: { type: mongoose.Schema.Types.Mixed, default: {} }, // {bucket: count}
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const QuizAnalyticsSnapshot = mongoose.model('QuizAnalyticsSnapshot', quizAnalyticsSnapshotSchema);
