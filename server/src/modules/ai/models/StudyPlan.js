import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Personalized Academic Study Plan' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    dailyAvailableMinutes: { type: Number, default: 120 },
    preferences: {
      preferredStudyWindows: [{ type: String }],
      restDays: [{ type: Number }], // 0 (Sun) - 6 (Sat)
    },
    version: { type: Number, default: 1 },
    lastRecalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

studyPlanSchema.index({ studentId: 1, status: 1 });

export const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
