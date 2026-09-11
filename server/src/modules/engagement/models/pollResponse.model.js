import mongoose from 'mongoose';

const pollResponseSchema = new mongoose.Schema(
  {
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    selectedOptionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PollOption' }],
    textResponse: { type: String, default: '' },
    firstRespondedAt: { type: Date, default: Date.now },
    lastRespondedAt: { type: Date, default: Date.now },
    responseTimeMs: { type: Number, default: 0 },
    isCorrect: { type: Boolean, default: null },
  },
  { timestamps: true }
);

pollResponseSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export const PollResponse = mongoose.model('PollResponse', pollResponseSchema);
