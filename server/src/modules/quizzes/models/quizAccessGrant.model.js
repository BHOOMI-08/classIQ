import mongoose from 'mongoose';

const quizAccessGrantSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    extraAttempts: { type: Number, default: 0, min: 0 },
    extendedOpeningAt: { type: Date, default: null },
    extendedClosingAt: { type: Date, default: null },
    extraDurationMinutes: { type: Number, default: 0, min: 0 },
    reason: { type: String, default: '' },

    status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
    usedAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizAccessGrantSchema.index({ quizId: 1, studentId: 1, status: 1 });

export const QuizAccessGrant = mongoose.model('QuizAccessGrant', quizAccessGrantSchema);
