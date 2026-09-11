import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    title: { type: String, default: 'New Conversation' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

aiConversationSchema.index({ userId: 1, classroomId: 1, updatedAt: -1 });

export const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
