import mongoose from 'mongoose';

const assignmentNotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'assignment_published',
        'assignment_updated',
        'deadline_24_hours',
        'deadline_6_hours',
        'deadline_1_hour',
        'submission_received',
        'submission_late',
        'deadline_extended',
        'changes_requested',
        'assignment_graded',
        'assignment_returned',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    deduplicationKey: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

assignmentNotificationSchema.index({ recipientId: 1, deduplicationKey: 1 }, { unique: true });

export const AssignmentNotification = mongoose.model('AssignmentNotification', assignmentNotificationSchema);
