import mongoose from 'mongoose';

const aiUsageLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', default: null, index: true },
    feature: { type: String, required: true },
    model: { type: String, default: 'gemini-1.5-flash' },
    requestTokens: { type: Number, default: 0 },
    responseTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    status: { type: String, enum: ['success', 'failed', 'quota_exceeded'], default: 'success' },
    errorCode: { type: String, default: '' },
    dateBucket: { type: String, required: true, index: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

aiUsageLogSchema.index({ userId: 1, dateBucket: 1 });
aiUsageLogSchema.index({ classroomId: 1, dateBucket: 1 });

export const AIUsageLog = mongoose.model('AIUsageLog', aiUsageLogSchema);
