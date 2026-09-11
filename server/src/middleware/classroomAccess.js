import mongoose from 'mongoose';
import { ApiError } from '../utils/api-error.js';
import { Classroom } from '../modules/classrooms/classroom.model.js';
import { Enrollment } from '../modules/enrollments/enrollment.model.js';

/**
 * Middleware ensuring current user is the owner (teacher) or admin of the classroom.
 * Expects params: :classId or :id
 */
export const requireClassroomOwner = async (req, _res, next) => {
  try {
    const classroomId = req.params.classId || req.params.classroomId || req.params.id;
    if (!classroomId || !mongoose.Types.ObjectId.isValid(classroomId)) {
      throw ApiError.badRequest('Classroom ID parameter required');
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    // Admins bypass ownership check
    if (req.user.role === 'admin') {
      req.classroom = classroom;
      return next();
    }

    const teacherOwnerId = (classroom.teacherId._id || classroom.teacherId).toString();
    if (req.user.role !== 'teacher' || teacherOwnerId !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not authorized to manage this classroom');
    }

    req.classroom = classroom;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware ensuring current user is either the owner teacher/admin OR an active enrolled student.
 */
export const requireClassroomMember = async (req, _res, next) => {
  try {
    const classroomId = req.params.classId || req.params.classroomId || req.params.id;
    if (!classroomId || !mongoose.Types.ObjectId.isValid(classroomId)) {
      throw ApiError.badRequest('Classroom ID parameter required');
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw ApiError.notFound('Classroom not found');
    }

    const teacherOwnerId = (classroom.teacherId._id || classroom.teacherId).toString();

    // Owner teacher or admin
    if (req.user.role === 'admin' || teacherOwnerId === req.user._id.toString()) {
      req.classroom = classroom;
      req.isOwner = true;
      return next();
    }

    // Check student active enrollment
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        classroomId: classroom._id,
        studentId: req.user._id,
        status: 'active',
      });

      if (!enrollment) {
        throw ApiError.forbidden('You are not actively enrolled in this classroom');
      }

      req.classroom = classroom;
      req.enrollment = enrollment;
      req.isOwner = false;
      return next();
    }

    throw ApiError.forbidden('Access denied to this classroom');
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware ensuring target classroom is currently active (not archived) for state mutation requests.
 */
export const requireActiveClassroom = (req, _res, next) => {
  if (req.classroom && req.classroom.status === 'archived') {
    return next(ApiError.forbidden('This classroom is archived and cannot be modified. Restore it first.'));
  }
  next();
};
