import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema(
  {
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource' },
    resourceTitle: { type: String, default: '' },
    pageNumber: { type: Number, default: 1 },
    sectionTitle: { type: String, default: '' },
    chunkId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentChunk' },
    excerpt: { type: String, default: '' },
  },
  { _id: false }
);

const aiMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIConversation', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    citations: [citationSchema],
    grounded: { type: Boolean, default: true },
    confidence: { type: String, enum: ['high', 'medium', 'low', 'unsupported'], default: 'high' },
    feedback: {
      rating: { type: String, enum: ['helpful', 'unhelpful', null], default: null },
      comment: { type: String, default: '' },
    },
    promptTokens: { type: Number, default: 0 },
    responseTokens: { type: Number, default: 0 },
    sequence: { type: Number, required: true },
  },
  { timestamps: true }
);

aiMessageSchema.index({ conversationId: 1, sequence: 1 });

export const AIMessage = mongoose.model('AIMessage', aiMessageSchema);
