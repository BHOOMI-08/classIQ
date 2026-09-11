import { AssignmentService } from '../services/assignment.service.js';
import { Assignment } from '../models/assignment.model.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const createAssignment = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const assignment = await AssignmentService.createAssignment({ classroomId: classId, ...req.body }, req.user._id);
    return ApiResponse.created(res, 'Assignment created successfully', { assignment });
  } catch (err) {
    next(err);
  }
};

export const getClassroomAssignments = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin';

    const filter = { classroomId: classId };
    if (!isTeacher) {
      filter.status = { $in: ['published', 'active', 'closed'] };
    } else {
      filter.status = { $ne: 'archived' };
    }

    const assignments = await Assignment.find(filter).sort({ dueAt: 1, createdAt: -1 }).lean();
    return ApiResponse.success(res, 'Assignments retrieved', { items: assignments });
  } catch (err) {
    next(err);
  }
};

export const getAssignmentDetails = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId)
      .populate('contentModuleId', 'title unitNumber')
      .populate('rubricId')
      .lean();
    return ApiResponse.success(res, 'Assignment details retrieved', { assignment });
  } catch (err) {
    next(err);
  }
};

export const publishAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await AssignmentService.publishAssignment(assignmentId, req.user._id);
    return ApiResponse.success(res, 'Assignment published', { assignment });
  } catch (err) {
    next(err);
  }
};

export const duplicateAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const duplicated = await AssignmentService.duplicateAssignment(assignmentId, req.user._id);
    return ApiResponse.created(res, 'Assignment duplicated', { assignment: duplicated });
  } catch (err) {
    next(err);
  }
};

export const archiveAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await AssignmentService.archiveAssignment(assignmentId, req.user._id);
    return ApiResponse.success(res, 'Assignment archived', { assignment });
  } catch (err) {
    next(err);
  }
};
