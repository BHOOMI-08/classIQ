import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index({ studentId: 1, resourceId: 1 }, { unique: true });

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
