import mongoose from 'mongoose';

const classroomPulseSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, default: 'General Topic' },
    prompt: { type: String, default: 'How confident are you with this topic?' },
    options: [{ type: String, default: ['confused', 'partially_clear', 'clear', 'can_explain'] }],
    status: { type: String, enum: ['draft', 'active', 'closed', 'archived'], default: 'draft', index: true },
    anonymous: { type: Boolean, default: true },
    allowResponseChange: { type: Boolean, default: true },
    showResultsToStudents: { type: Boolean, default: true },
    startedAt: { type: Date, default: null },
    endsAt: { type: Date, default: null, index: true },
    closedAt: { type: Date, default: null },
    totalResponses: { type: Number, default: 0 },
    confidenceIndex: { type: Number, default: null },
  },
  { timestamps: true }
);

classroomPulseSchema.index({ classroomId: 1, status: 1, createdAt: -1 });

export const ClassroomPulse = mongoose.model('ClassroomPulse', classroomPulseSchema);
