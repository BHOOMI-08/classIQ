import { ContentResource } from '../models/contentResource.model.js';
import { Enrollment } from '../../enrollments/enrollment.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { ApiError } from '../../../utils/api-error.js';

export const requirePublishedResource = async (req, _res, next) => {
  try {
    const resourceId = req.params.resourceId;
    if (!resourceId) return next(ApiError.badRequest('Resource ID is required'));

    const resource = await ContentResource.findById(resourceId);
    if (!resource) return next(ApiError.notFound('Content resource not found'));

    const classroom = await Classroom.findById(resource.classroomId);
    if (!classroom) return next(ApiError.notFound('Classroom not found'));

    const isTeacher = classroom.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      // Check student active enrollment
      const enrollment = await Enrollment.findOne({
        classroomId: resource.classroomId,
        studentId: req.user._id,
        status: 'active',
      });

      if (!enrollment) {
        return next(ApiError.forbidden('You are not enrolled in this classroom'));
      }

      if (resource.status !== 'published') {
        return next(ApiError.forbidden('This resource has not been published yet'));
      }
    }

    req.resource = resource;
    req.classroom = classroom;
    next();
  } catch (err) {
    next(err);
  }
};
