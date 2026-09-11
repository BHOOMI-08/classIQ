import mongoose from 'mongoose';

const rubricCriterionSchema = new mongoose.Schema(
  {
    rubricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rubric',
      required: true,
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
      index: true,
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
    maximumMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    weightPercentage: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    levels: [
      {
        label: { type: String, required: true },
        description: { type: String, default: '' },
        marks: { type: Number, required: true },
        minimumMarks: { type: Number, default: 0 },
        maximumMarks: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const RubricCriterion = mongoose.model('RubricCriterion', rubricCriterionSchema);
