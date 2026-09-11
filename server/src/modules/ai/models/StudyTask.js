import mongoose from 'mongoose';

const studyTaskSchema = new mongoose.Schema(
  {
    studyPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledDate: { type: Date, required: true, index: true },
    startTime: { type: String, default: '09:00' },
    durationMinutes: { type: Number, required: true, default: 45 },
    type: {
      type: String,
      enum: ['revision', 'assignment', 'quiz_prep', 'resource_reading', 'practice_test', 'catchup_buffer'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    topic: { type: String, default: 'General' },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', default: null },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentResource', default: null },
    priorityScore: { type: Number, required: true, default: 50 },
    priorityLabel: { type: String, enum: ['urgent_critical', 'high', 'medium', 'low'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'skipped', 'rescheduled'], default: 'pending', index: true },
    source: { type: String, enum: ['deterministic_engine', 'user_custom', 'recalculation'], default: 'deterministic_engine' },
    completedAt: { type: Date, default: null },
    skipReason: { type: String, default: '' },
  },
  { timestamps: true }
);

studyTaskSchema.index({ studentId: 1, scheduledDate: 1, status: 1 });

export const StudyTask = mongoose.model('StudyTask', studyTaskSchema);
