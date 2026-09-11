import { Assignment } from '../models/assignment.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { ApiError } from '../../../utils/api-error.js';

export const requireAssignmentOwner = async (req, _res, next) => {
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
      return next(ApiError.forbidden('Only the classroom teacher can modify this assignment'));
    }

    req.assignment = assignment;
    req.classroom = classroom;
    next();
  } catch (err) {
    next(err);
  }
};
