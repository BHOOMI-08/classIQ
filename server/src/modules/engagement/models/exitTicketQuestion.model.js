import mongoose from 'mongoose';

const exitTicketQuestionSchema = new mongoose.Schema(
  {
    exitTicketId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExitTicket', required: true, index: true },
    type: {
      type: String,
      enum: ['single_choice', 'true_false', 'short_answer', 'confidence_scale'],
      required: true,
      default: 'single_choice',
    },
    prompt: { type: String, required: true },
    options: [{ type: String }], // Option choices for single choice
    correctAnswer: { type: String, default: '' },
    acceptedAnswers: [{ type: String }],
    marks: { type: Number, default: 1 },
    topic: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    explanation: { type: String, default: '' },
    sourceChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentChunk' }],
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

exitTicketQuestionSchema.index({ exitTicketId: 1, order: 1 });

export const ExitTicketQuestion = mongoose.model('ExitTicketQuestion', exitTicketQuestionSchema);
