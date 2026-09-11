import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contentModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentModule',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
    },
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    topic: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'General',
      index: true,
    },
    unit: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'Unit 1',
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'medium',
    },
    assignmentType: {
      type: String,
      enum: ['homework', 'project', 'lab', 'essay', 'case_study', 'coding', 'worksheet', 'research', 'presentation', 'other'],
      default: 'homework',
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    openingAt: {
      type: Date,
      default: Date.now,
    },
    dueAt: {
      type: Date,
      required: true,
      index: true,
    },
    closingAt: {
      type: Date,
      default: null,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'active', 'closed', 'archived', 'cancelled'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    scheduledPublishAt: {
      type: Date,
      default: null,
      index: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    allowLateSubmission: {
      type: Boolean,
      default: true,
    },
    latePolicy: {
      mode: {
        type: String,
        enum: ['blocked', 'allowed', 'allowed_with_penalty', 'approval_required'],
        default: 'allowed_with_penalty',
      },
      penaltyType: {
        type: String,
        enum: ['fixed_marks', 'percentage_total', 'percentage_per_day', 'fixed_per_day'],
        default: 'percentage_per_day',
      },
      penaltyValue: {
        type: Number,
        default: 10, // e.g. 10% penalty per day
      },
      maximumLateDurationMinutes: {
        type: Number,
        default: 4320, // 3 days max
      },
    },
    allowSubmissionReplacement: {
      type: Boolean,
      default: true,
    },
    maximumAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    maximumFiles: {
      type: Number,
      default: 5,
    },
    allowedFileTypes: [
      {
        type: String,
        lowercase: true,
      },
    ],
    maximumFileSizeBytes: {
      type: Number,
      default: 25 * 1024 * 1024, // 25MB
    },
    submissionMode: {
      type: String,
      enum: ['file', 'text', 'file_and_text'],
      default: 'file_and_text',
    },
    rubricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rubric',
      default: null,
    },
    hasRubric: {
      type: Boolean,
      default: false,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    linkedResourceCount: {
      type: Number,
      default: 0,
    },
    attachmentCount: {
      type: Number,
      default: 0,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    gradedSubmissions: {
      type: Number,
      default: 0,
    },
    lateSubmissions: {
      type: Number,
      default: 0,
    },
    missingSubmissions: {
      type: Number,
      default: 0,
    },
    averageMarks: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ classroomId: 1, slug: 1 }, { unique: true });
assignmentSchema.index({ classroomId: 1, status: 1, dueAt: 1 });
assignmentSchema.index({ status: 1, scheduledPublishAt: 1 });
assignmentSchema.index({ status: 1, dueAt: 1 });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
