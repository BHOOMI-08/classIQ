import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: String, required: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'true_false', 'concept_check', 'opinion', 'prediction'],
      required: true,
      default: 'single_choice',
    },
    topic: { type: String, default: 'General Topic' },
    status: { type: String, enum: ['draft', 'active', 'closed', 'archived'], default: 'draft', index: true },
    anonymous: { type: Boolean, default: false },
    randomizeOptions: { type: Boolean, default: false },
    allowResponseChange: { type: Boolean, default: false },
    showLiveResults: { type: Boolean, default: true },
    showCorrectAnswerAfterClose: { type: Boolean, default: true },
    explanation: { type: String, default: '' },
    startedAt: { type: Date, default: null },
    endsAt: { type: Date, default: null, index: true },
    closedAt: { type: Date, default: null },
    totalResponses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pollSchema.index({ classroomId: 1, status: 1, createdAt: -1 });

export const Poll = mongoose.model('Poll', pollSchema);
