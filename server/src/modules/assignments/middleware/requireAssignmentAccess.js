import { Assignment } from '../models/assignment.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { ApiError } from '../../../utils/api-error.js';

export const requireAssignmentAccess = async (req, _res, next) => {
  try {
    const assignmentId = req.params.assignmentId;
    if (!assignmentId) return next(ApiError.badRequest('Assignment ID is required'));

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(ApiError.notFound('Assignment not found'));

    const classroom = await Classroom.findById(assignment.classroomId);
    if (!classroom) return next(ApiError.notFound('Classroom not found'));

    const isTeacher = classroom.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      const enrollment = await Enrollment.findOne({
        classroomId: assignment.classroomId,
        studentId: req.user._id,
        status: 'active',
      });

      if (!enrollment) {
        return next(ApiError.forbidden('You are not enrolled in this classroom'));
      }

      if (assignment.status === 'draft' || assignment.status === 'scheduled') {
        return next(ApiError.forbidden('Assignment is not published yet'));
      }
    }

    req.assignment = assignment;
    req.classroom = classroom;
    next();
  } catch (err) {
    next(err);
  }
};
