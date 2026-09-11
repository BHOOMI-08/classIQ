import mongoose from 'mongoose';

const questionOptionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    label: { type: String, default: '' }, // A, B, C, D
    text: { type: String, required: true },
    order: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true, default: false }, // NEVER exposed to students during active attempts
    feedback: { type: String, default: '' }, // shown after release per policy
    misconceptionTag: { type: String, default: '' },
  },
  { timestamps: true }
);

questionOptionSchema.index({ questionId: 1, order: 1 });

export const QuestionOption = mongoose.model('QuestionOption', questionOptionSchema);
