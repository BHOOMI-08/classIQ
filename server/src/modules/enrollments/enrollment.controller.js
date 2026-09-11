import { EnrollmentService } from './enrollment.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export const joinClassroom = async (req, res, next) => {
  try {
    const result = await EnrollmentService.joinClassroom(
      req.user,
      req.body.joinCode,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.created(res, result, 'Successfully joined classroom');
  } catch (error) {
    next(error);
  }
};

export const getStudentClassrooms = async (req, res, next) => {
  try {
    const result = await EnrollmentService.getStudentClassrooms(req.user._id, req.query);
    ApiResponse.success(res, result, 'Enrolled classrooms fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const leaveClassroom = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const result = await EnrollmentService.leaveClassroom(
      req.user._id,
      classroomId,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, result, 'Successfully left classroom');
  } catch (error) {
    next(error);
  }
};

export const getClassroomStudents = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const result = await EnrollmentService.getClassroomStudents(classroomId, req.query);
    ApiResponse.success(res, result, 'Classroom student roster fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const removeStudent = async (req, res, next) => {
  try {
    const { classId, studentId } = req.params;
    const result = await EnrollmentService.removeStudent(
      classId,
      studentId,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, result, 'Student removed from classroom');
  } catch (error) {
    next(error);
  }
};

export const blockStudent = async (req, res, next) => {
  try {
    const { classId, studentId } = req.params;
    const { reason } = req.body;
    const result = await EnrollmentService.blockStudent(
      classId,
      studentId,
      reason,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, result, 'Student blocked from classroom');
  } catch (error) {
    next(error);
  }
};

export const unblockStudent = async (req, res, next) => {
  try {
    const { classId, studentId } = req.params;
    const result = await EnrollmentService.unblockStudent(
      classId,
      studentId,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, result, 'Student unblocked successfully');
  } catch (error) {
    next(error);
  }
};
