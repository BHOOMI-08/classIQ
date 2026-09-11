import mongoose from 'mongoose';

const topicPerformanceSchema = new mongoose.Schema(
  {
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult', required: true, index: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    topic: { type: String, required: true },

    totalQuestions: { type: Number, default: 0 },
    attemptedQuestions: { type: Number, default: 0 },
    correctQuestions: { type: Number, default: 0 },
    incorrectQuestions: { type: Number, default: 0 },
    partialQuestions: { type: Number, default: 0 },

    marksAvailable: { type: Number, default: 0 },
    marksAwarded: { type: Number, default: 0 },
    accuracyPercentage: { type: Number, default: 0 },
    averageTimeSeconds: { type: Number, default: 0 },

    proficiencyLabel: {
      type: String,
      enum: ['strong', 'developing', 'needs_revision', 'critical'],
      default: 'developing',
    },
  },
  { timestamps: true }
);

topicPerformanceSchema.index({ resultId: 1, topic: 1 });
topicPerformanceSchema.index({ quizId: 1, studentId: 1 });

export const TopicPerformance = mongoose.model('TopicPerformance', topicPerformanceSchema);
