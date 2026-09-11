import mongoose from 'mongoose';

const pulseResponseSchema = new mongoose.Schema(
  {
    pulseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassroomPulse', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    response: {
      type: String,
      enum: ['confused', 'partially_clear', 'clear', 'can_explain'],
      required: true,
    },
    responseWeight: { type: Number, required: true },
    firstRespondedAt: { type: Date, default: Date.now },
    lastRespondedAt: { type: Date, default: Date.now },
    changeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pulseResponseSchema.index({ pulseId: 1, studentId: 1 }, { unique: true });

export const PulseResponse = mongoose.model('PulseResponse', pulseResponseSchema);
