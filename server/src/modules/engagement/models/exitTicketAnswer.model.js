import mongoose from 'mongoose';

const exitTicketAnswerSchema = new mongoose.Schema(
  {
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExitTicketAttempt', required: true, index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExitTicketQuestion', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    responseValue: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

exitTicketAnswerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export const ExitTicketAnswer = mongoose.model('ExitTicketAnswer', exitTicketAnswerSchema);
