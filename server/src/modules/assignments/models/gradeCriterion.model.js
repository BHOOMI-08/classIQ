import mongoose from 'mongoose';

const gradeCriterionSchema = new mongoose.Schema(
  {
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
      index: true,
    },
    rubricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rubric',
      required: true,
    },
    criterionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RubricCriterion',
      required: true,
    },
    criterionTitleSnapshot: {
      type: String,
      required: true,
    },
    maximumMarksSnapshot: {
      type: Number,
      required: true,
    },
    awardedMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    selectedLevel: {
      label: { type: String, default: '' },
      description: { type: String, default: '' },
      marks: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const GradeCriterion = mongoose.model('GradeCriterion', gradeCriterionSchema);
