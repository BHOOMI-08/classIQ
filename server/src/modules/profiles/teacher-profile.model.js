import mongoose, { Schema } from 'mongoose';

const teacherProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    employeeId: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    subjects: [{ type: String, trim: true }],
    institution: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

teacherProfileSchema.index({ employeeId: 1, institution: 1 }, { unique: true });

export const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
