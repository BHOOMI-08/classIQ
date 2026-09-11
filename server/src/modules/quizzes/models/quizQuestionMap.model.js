import mongoose from 'mongoose';

const quizQuestionMapSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    questionVersion: { type: Number, default: 1 },
    order: { type: Number, required: true },
    marks: { type: Number, required: true, min: 0 },
    negativeMarks: { type: Number, default: 0, min: 0 },
    isRequired: { type: Boolean, default: true },
    poolName: { type: String, default: 'default' },
    section: { type: String, default: '' },
    // Snapshot copies for stability
    topicSnapshot: { type: String, default: '' },
    difficultySnapshot: { type: String, default: 'medium' },
  },
  { timestamps: true }
);

quizQuestionMapSchema.index({ quizId: 1, questionId: 1 }, { unique: true });
quizQuestionMapSchema.index({ quizId: 1, order: 1 });

export const QuizQuestionMap = mongoose.model('QuizQuestionMap', quizQuestionMapSchema);
