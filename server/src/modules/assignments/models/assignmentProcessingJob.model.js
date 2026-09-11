import mongoose from 'mongoose';

const assignmentProcessingJobSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
      index: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      default: null,
      index: true,
    },
    jobType: {
      type: String,
      enum: [
        'publish_scheduled_assignment',
        'close_assignment',
        'detect_missing_submissions',
        'send_deadline_reminders',
        'recalculate_assignment_analytics',
        'generate_ai_assignment',
        'generate_ai_rubric',
        'prepare_bulk_download',
        'export_assignment_results',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    lastErrorCode: {
      type: String,
      default: null,
    },
    lastErrorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const AssignmentProcessingJob = mongoose.model('AssignmentProcessingJob', assignmentProcessingJobSchema);
