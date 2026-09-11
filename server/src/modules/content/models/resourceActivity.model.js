import mongoose from 'mongoose';

const resourceActivitySchema = new mongoose.Schema(
  {
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      enum: ['teacher', 'student', 'admin'],
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'resource_created',
        'resource_updated',
        'resource_published',
        'resource_unpublished',
        'resource_archived',
        'resource_restored',
        'resource_opened',
        'resource_downloaded',
        'resource_bookmarked',
        'bookmark_removed',
        'resource_completed',
        'revision_added',
        'revision_completed',
        'processing_started',
        'processing_completed',
        'processing_failed',
        'version_replaced',
        'ai_summary_generated',
        'flashcards_generated',
        'revision_questions_generated',
        'semantic_search_used',
      ],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ResourceActivity = mongoose.model('ResourceActivity', resourceActivitySchema);
