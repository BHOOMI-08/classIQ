import mongoose from 'mongoose';

const questionCaseSchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    scenario: { type: String, required: true },
    supportingText: { type: String, default: '' },
    sourceResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource' }],
    sourceChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ContentChunk' }],
    attachments: [{ type: String }],
    topic: { type: String, default: '' },
    unit: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const QuestionCase = mongoose.model('QuestionCase', questionCaseSchema);
