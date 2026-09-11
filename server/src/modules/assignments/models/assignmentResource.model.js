import mongoose from 'mongoose';

const assignmentResourceSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContentResource',
      required: true,
      index: true,
    },
    resourceVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceVersion',
      default: null,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relationType: {
      type: String,
      enum: ['prerequisite', 'reference', 'reading', 'source_for_assignment', 'revision'],
      default: 'reference',
    },
    isRequired: {
      type: Boolean,
      default: false,
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

assignmentResourceSchema.index({ assignmentId: 1, resourceId: 1 }, { unique: true });

export const AssignmentResource = mongoose.model('AssignmentResource', assignmentResourceSchema);
