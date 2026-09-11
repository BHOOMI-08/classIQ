import mongoose, { Schema } from 'mongoose';

const studentProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

studentProfileSchema.index({ rollNumber: 1, institution: 1 }, { unique: true });

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
