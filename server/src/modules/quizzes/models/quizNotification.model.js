import mongoose from 'mongoose';

const quizNotificationSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientRole: { type: String, enum: ['student', 'teacher'], required: true },
    type: {
      type: String,
      enum: ['quiz_published', 'quiz_opening_soon', 'quiz_closing_soon', 'result_released', 'regrade_complete', 'quiz_cancelled', 'access_grant_given'],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

quizNotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export const QuizNotification = mongoose.model('QuizNotification', quizNotificationSchema);
