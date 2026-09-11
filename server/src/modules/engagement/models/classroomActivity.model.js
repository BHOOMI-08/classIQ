import mongoose from 'mongoose';

const classroomActivitySchema = new mongoose.Schema(
  {
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, enum: ['teacher', 'student', 'admin', 'system'], required: true },
    eventType: {
      type: String,
      required: true,
      enum: [
        'attendance_session_started',
        'attendance_session_ended',
        'resource_published',
        'assignment_created',
        'quiz_published',
        'pulse_started',
        'pulse_closed',
        'poll_started',
        'poll_closed',
        'poll_answer_revealed',
        'doubt_submitted',
        'doubt_resolved',
        'doubt_cluster_created',
        'exit_ticket_launched',
        'exit_ticket_closed',
        'announcement_posted',
        'ai_revision_generated',
      ],
    },
    sourceModule: {
      type: String,
      enum: ['attendance', 'content', 'assignments', 'quizzes', 'engagement', 'announcements', 'ai'],
      required: true,
      index: true,
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    visibility: {
      type: String,
      enum: ['teacher_only', 'students', 'all_members'],
      default: 'all_members',
      index: true,
    },
    occurredAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

classroomActivitySchema.index({ classroomId: 1, occurredAt: -1 });
classroomActivitySchema.index({ classroomId: 1, visibility: 1, occurredAt: -1 });

export const ClassroomActivity = mongoose.model('ClassroomActivity', classroomActivitySchema);
