import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema(
  {
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    text: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    isCorrect: { type: Boolean, default: false },
    misconceptionTag: { type: String, default: '' },
  },
  { timestamps: true }
);

pollOptionSchema.index({ pollId: 1, order: 1 });

export const PollOption = mongoose.model('PollOption', pollOptionSchema);
