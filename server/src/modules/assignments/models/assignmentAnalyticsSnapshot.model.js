import mongoose from 'mongoose';

const assignmentAnalyticsSnapshotSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    totalEnrolledStudents: {
      type: Number,
      default: 0,
    },
    eligibleStudents: {
      type: Number,
      default: 0,
    },
    startedCount: {
      type: Number,
      default: 0,
    },
    submittedCount: {
      type: Number,
      default: 0,
    },
    lateCount: {
      type: Number,
      default: 0,
    },
    missingCount: {
      type: Number,
      default: 0,
    },
    underReviewCount: {
      type: Number,
      default: 0,
    },
    gradedCount: {
      type: Number,
      default: 0,
    },
    returnedCount: {
      type: Number,
      default: 0,
    },
    averageMarks: {
      type: Number,
      default: 0,
    },
    medianMarks: {
      type: Number,
      default: 0,
    },
    highestMarks: {
      type: Number,
      default: 0,
    },
    lowestMarks: {
      type: Number,
      default: 0,
    },
    passCount: {
      type: Number,
      default: 0,
    },
    failCount: {
      type: Number,
      default: 0,
    },
    passRate: {
      type: Number,
      default: 0,
    },
    submissionRate: {
      type: Number,
      default: 0,
    },
    lateRate: {
      type: Number,
      default: 0,
    },
    averageSubmissionLeadMinutes: {
      type: Number,
      default: 0,
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const AssignmentAnalyticsSnapshot = mongoose.model(
  'AssignmentAnalyticsSnapshot',
  assignmentAnalyticsSnapshotSchema
);
