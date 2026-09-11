import mongoose from 'mongoose';

const exitTicketSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    topic: { type: String, default: 'Lecture Exit Ticket' },
    learningObjective: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'active', 'closed', 'archived'], default: 'draft', index: true },
    durationMinutes: { type: Number, default: 5 },
    questionCount: { type: Number, default: 3 },
    aiGenerated: { type: Boolean, default: false },
    sourceResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource' }],
    sourceChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentChunk' }],
    startedAt: { type: Date, default: null },
    endsAt: { type: Date, default: null, index: true },
    closedAt: { type: Date, default: null },
    showResultsToStudents: { type: Boolean, default: true },
    allowRetry: { type: Boolean, default: false },
  },
  { timestamps: true }
);

exitTicketSchema.index({ classroomId: 1, status: 1, createdAt: -1 });

export const ExitTicket = mongoose.model('ExitTicket', exitTicketSchema);
