import { ContentResource } from '../models/contentResource.model.js';
import { Classroom } from '../../classrooms/classroom.model.js';
import { ApiError } from '../../../utils/api-error.js';

export const requireResourceOwner = async (req, _res, next) => {
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
      return next(ApiError.forbidden('Only the classroom teacher can modify this resource'));
    }

    req.resource = resource;
    req.classroom = classroom;
    next();
  } catch (err) {
    next(err);
  }
};
