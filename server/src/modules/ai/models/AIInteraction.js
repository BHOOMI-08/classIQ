import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', default: null, index: true },
    feature: { type: String, required: true, index: true },
    inputSummary: { type: String, default: '' },
    status: { type: String, enum: ['success', 'failed', 'quota_exceeded', 'injection_rejected'], default: 'success' },
    model: { type: String, default: 'gemini-1.5-flash' },
    grounded: { type: Boolean, default: false },
    citationCount: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    promptTokens: { type: Number, default: 0 },
    responseTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    errorCode: { type: String, default: '' },
  },
  { timestamps: true }
);

aiInteractionSchema.index({ userId: 1, createdAt: -1 });
aiInteractionSchema.index({ classroomId: 1, feature: 1 });

export const AIInteraction = mongoose.model('AIInteraction', aiInteractionSchema);
