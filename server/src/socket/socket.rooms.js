import { Classroom } from '../modules/classrooms/classroom.model.js';
import { Enrollment } from '../modules/enrollments/enrollment.model.js';

export const ROOMS = Object.freeze({
  teacherSessionRoom: (sessionId) => `attendance:session:${sessionId}:teacher`,
  studentSessionRoom: (sessionId, studentId) => `attendance:session:${sessionId}:student:${studentId}`,
  classroomAttendanceRoom: (classroomId) => `attendance:classroom:${classroomId}`,
  attendanceSecurityRoom: (sessionId) => `attendance:session:${sessionId}:security`,
});

export const canJoinTeacherSessionRoom = async (user, classroomId) => {
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;
  const classroom = await Classroom.findById(classroomId).lean();
  return classroom && classroom.teacherId.toString() === user._id.toString();
};

export const canJoinStudentSessionRoom = async (user, classroomId, targetStudentId) => {
  if (user.role === 'admin') return true;
  if (user.role === 'student') {
    if (user._id.toString() !== targetStudentId) return false;
    const enrollment = await Enrollment.findOne({ classroomId, studentId: user._id, status: 'active' }).lean();
    return Boolean(enrollment);
  }
  if (user.role === 'teacher') {
    const classroom = await Classroom.findById(classroomId).lean();
    return classroom && classroom.teacherId.toString() === user._id.toString();
  }
  return false;
};
