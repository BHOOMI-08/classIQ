import mongoose from 'mongoose';

const quizAnswerSchema = new mongoose.Schema(
  {
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    attemptQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttemptQuestion', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    answerType: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'long_answer', 'case_based', 'coding'],
      required: true,
    },

    // Answer payload (only one is used based on type)
    selectedOptionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    booleanAnswer: { type: Boolean, default: null },
    textAnswer: { type: String, default: '' },
    codeAnswer: { type: String, default: '' },
    language: { type: String, default: '' },
    fileReference: { type: String, default: null },

    isFlagged: { type: Boolean, default: false },

    firstAnsweredAt: { type: Date, default: null },
    lastSavedAt: { type: Date, default: null },
    saveVersion: { type: Number, default: 0 }, // server-assigned monotonic version
    clientSequence: { type: Number, default: 0 }, // client-sent monotonic counter (staleness guard)
    timeSpentSeconds: { type: Number, default: 0 }, // client-estimated, treated as advisory
    visitCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['unanswered', 'draft', 'saved', 'submitted', 'invalid'],
      default: 'unanswered',
    },
  },
  { timestamps: true }
);

quizAnswerSchema.index({ attemptId: 1, attemptQuestionId: 1 }, { unique: true });
quizAnswerSchema.index({ attemptId: 1, status: 1 });

export const QuizAnswer = mongoose.model('QuizAnswer', quizAnswerSchema);
