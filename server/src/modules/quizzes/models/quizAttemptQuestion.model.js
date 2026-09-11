import mongoose from 'mongoose';

/**
 * Immutable per-attempt question snapshot.
 * Created at attempt start — teacher edits to bank questions do NOT affect active attempts.
 * Answer keys are excluded from student-facing serializers.
 */
const quizAttemptQuestionSchema = new mongoose.Schema(
  {
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    originalQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    questionVersion: { type: Number, default: 1 },
    displayOrder: { type: Number, required: true },

    type: { type: String, required: true },
    promptSnapshot: { type: String, required: true },
    contextSnapshot: { type: String, default: '' },
    instructionsSnapshot: { type: String, default: '' },
    topicSnapshot: { type: String, default: '' },
    difficultySnapshot: { type: String, default: 'medium' },

    marks: { type: Number, required: true },
    negativeMarks: { type: Number, default: 0 },

    // Options snapshot (isCorrect intentionally omitted for student serialization)
    optionSnapshot: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId },
        text: { type: String },
        label: { type: String },
        order: { type: Number },
        misconceptionTag: { type: String, default: '' },
        // isCorrect stored here but excluded by student serializer
        isCorrect: { type: Boolean, select: false },
      },
    ],

    // Answer key material (never sent to students)
    answerKeySnapshot: { type: mongoose.Schema.Types.Mixed, select: false },
    acceptedAnswersSnapshot: { type: [String], select: false },
    answerMatchingModeSnapshot: { type: String, select: false },

    explanationSnapshot: { type: String, default: '' }, // shown post-result per policy
    caseSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    codingConfigSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

quizAttemptQuestionSchema.index({ attemptId: 1, displayOrder: 1 });

export const QuizAttemptQuestion = mongoose.model('QuizAttemptQuestion', quizAttemptQuestionSchema);
