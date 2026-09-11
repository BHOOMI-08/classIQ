import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    status: {
      type: String,
      enum: ['pending', 'auto_graded', 'manual_review_required', 'finalized', 'released', 'superseded', 'withheld'],
      default: 'pending',
      index: true,
    },

    // Score breakdown — calculated server-side from QuestionScore records
    objectiveMarks: { type: Number, default: 0 },
    subjectiveMarks: { type: Number, default: 0 },
    adjustmentMarks: { type: Number, default: 0 },
    negativeMarks: { type: Number, default: 0 },
    finalMarks: { type: Number, default: 0 }, // = objectiveMarks + subjectiveMarks + adjustmentMarks - negativeMarks, clamped [0, totalMarks]
    totalMarks: { type: Number, required: true },

    percentage: { type: Number, default: 0 },
    gradeLabel: { type: String, default: '' },
    passed: { type: Boolean, default: false },

    // Question outcome counts
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    partiallyCorrectCount: { type: Number, default: 0 },
    unansweredCount: { type: Number, default: 0 },
    manualReviewRequiredCount: { type: Number, default: 0 },

    timeTakenSeconds: { type: Number, default: 0 },
    rank: { type: Number, default: null },
    percentile: { type: Number, default: null },

    releasedAt: { type: Date, default: null },
    releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    gradingVersion: { type: Number, default: 1 },
    supersededResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult', default: null },
  },
  { timestamps: true }
);

quizResultSchema.index({ quizId: 1, studentId: 1 });
quizResultSchema.index({ quizId: 1, status: 1 });

export const QuizResult = mongoose.model('QuizResult', quizResultSchema);
