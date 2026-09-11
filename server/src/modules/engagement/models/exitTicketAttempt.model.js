import mongoose from 'mongoose';

const exitTicketAttemptSchema = new mongoose.Schema(
  {
    exitTicketId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExitTicket', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'auto_graded', 'review_required', 'graded'],
      default: 'in_progress',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    totalMarks: { type: Number, default: 0 },
    marksAwarded: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    understandingLabel: {
      type: String,
      enum: ['strong', 'acceptable', 'needs_revision', 'critical'],
      default: 'acceptable',
    },
    requiresReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

exitTicketAttemptSchema.index({ exitTicketId: 1, studentId: 1 }, { unique: true });

export const ExitTicketAttempt = mongoose.model('ExitTicketAttempt', exitTicketAttemptSchema);
