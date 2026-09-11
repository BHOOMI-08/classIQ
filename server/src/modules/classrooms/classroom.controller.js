import { ClassroomService } from './classroom.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export const createClassroom = async (req, res, next) => {
  try {
    const classroom = await ClassroomService.createClassroom(
      req.user,
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.created(res, { classroom }, 'Classroom created successfully');
  } catch (error) {
    next(error);
  }
};

export const getTeacherClassrooms = async (req, res, next) => {
  try {
    const result = await ClassroomService.getTeacherClassrooms(req.user._id, req.query);
    ApiResponse.success(res, result, 'Teacher classrooms fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getClassroomDetails = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const result = await ClassroomService.getClassroomDetails(classroomId, req.user);
    ApiResponse.success(res, result, 'Classroom details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateClassroom = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const classroom = await ClassroomService.updateClassroom(
      classroomId,
      req.user,
      req.body,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, { classroom }, 'Classroom updated successfully');
  } catch (error) {
    next(error);
  }
};

export const archiveClassroom = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const classroom = await ClassroomService.archiveClassroom(
      classroomId,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, { classroom }, 'Classroom archived successfully');
  } catch (error) {
    next(error);
  }
};

export const restoreClassroom = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const classroom = await ClassroomService.restoreClassroom(
      classroomId,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, { classroom }, 'Classroom restored successfully');
  } catch (error) {
    next(error);
  }
};

export const regenerateJoinCode = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const result = await ClassroomService.regenerateJoinCode(
      classroomId,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, result, 'Join code regenerated successfully');
  } catch (error) {
    next(error);
  }
};
