import mongoose from 'mongoose';

const topicMasterySchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    masteryScore: { type: Number, required: true, default: 50 }, // 0 - 100
    classification: { type: String, enum: ['strong', 'developing', 'weak', 'critical'], required: true },
    evidence: {
      quizAccuracyPercentage: { type: Number, default: 0 },
      recentQuizScore: { type: Number, default: 0 },
      assignmentTopicScore: { type: Number, default: 0 },
      practiceQuizScore: { type: Number, default: 0 },
      resourceCompletionPercentage: { type: Number, default: 0 },
      totalQuestionsAttempted: { type: Number, default: 0 },
    },
    trend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
    recommendedAction: { type: String, default: 'Review notes and practice flashcards.' },
    linkedResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource' }],
    confidenceLevel: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  },
  { _id: false }
);

const weaknessProfileSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    topics: [topicMasterySchema],
    overallStatus: { type: String, enum: ['excellent', 'good', 'needs_attention', 'critical'], default: 'good' },
    algorithmVersion: { type: String, default: 'v1.0' },
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

weaknessProfileSchema.index({ studentId: 1, classroomId: 1 }, { unique: true });

export const WeaknessProfile = mongoose.model('WeaknessProfile', weaknessProfileSchema);
