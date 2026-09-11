import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sourceResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource' }],
    sourceChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentChunk' }],

    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'long_answer', 'case_based', 'coding'],
      required: true,
    },

    title: { type: String, default: '' },
    prompt: { type: String, required: true },
    context: { type: String, default: '' },
    instructions: { type: String, default: '' },

    topic: { type: String, default: '', index: true },
    subtopic: { type: String, default: '' },
    unit: { type: String, default: '' },
    learningOutcome: { type: String, default: '' },

    bloomLevel: {
      type: String,
      enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
      default: 'understand',
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },

    defaultMarks: { type: Number, default: 1, min: 0 },
    defaultNegativeMarks: { type: Number, default: 0, min: 0 },

    // Internal answer data (never returned to students during active attempts)
    explanation: { type: String, default: '' },
    answerKey: { type: mongoose.Schema.Types.Mixed, default: null }, // boolean for true_false, [optionId] for choice
    acceptedAnswers: [{ type: String }], // for short_answer
    answerMatchingMode: {
      type: String,
      enum: ['exact', 'case_insensitive', 'normalized', 'keyword', 'manual'],
      default: 'manual',
    },

    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionCase', default: null },

    codingConfig: {
      allowedLanguages: [{ type: String }],
      starterCode: { type: String, default: '' },
      expectedConcepts: [{ type: String }],
      visibleTestDescriptions: [{ type: String }],
      gradingRubric: { type: String, default: '' },
    },

    aiGenerated: { type: Boolean, default: false },
    aiGenerationMetadata: { type: mongoose.Schema.Types.Mixed, default: null },

    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    version: { type: Number, default: 1 },
    isReusable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

questionSchema.index({ classroomId: 1, type: 1, difficulty: 1, status: 1 });
questionSchema.index({ classroomId: 1, topic: 1, status: 1 });

export const Question = mongoose.model('Question', questionSchema);
