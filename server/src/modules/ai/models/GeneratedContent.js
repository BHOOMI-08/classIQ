import mongoose from 'mongoose';

const generatedContentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['teacher', 'student', 'admin'], required: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    type: {
      type: String,
      enum: [
        'lecture_plan',
        'announcement',
        'class_summary',
        'revision_pack',
        'study_plan',
        'quiz_explanation',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    structuredContent: { type: mongoose.Schema.Types.Mixed, default: {} },
    sourceResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource' }],
    citations: [{ type: mongoose.Schema.Types.Mixed }],
    status: { type: String, enum: ['draft', 'saved', 'published', 'archived'], default: 'draft' },
    grounded: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

generatedContentSchema.index({ classroomId: 1, type: 1, createdAt: -1 });

export const GeneratedContent = mongoose.model('GeneratedContent', generatedContentSchema);
