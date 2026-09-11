import mongoose from 'mongoose';

const rubricSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    gradingMethod: {
      type: String,
      enum: ['points', 'weighted', 'levels'],
      default: 'points',
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateName: {
      type: String,
      default: null,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const Rubric = mongoose.model('Rubric', rubricSchema);
