import { ContentModuleService } from '../services/contentModule.service.js';
import { ApiResponse } from '../../../utils/api-response.js';

export const createModule = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { title, description, unitNumber } = req.body;
    const moduleDoc = await ContentModuleService.createModule({
      classroomId: classId,
      userId: req.user._id,
      title,
      description,
      unitNumber,
    });
    return ApiResponse.created(res, 'Content module created', { module: moduleDoc });
  } catch (err) {
    next(err);
  }
};

export const getClassroomModules = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin';
    const modules = await ContentModuleService.getClassroomModules(classId, isTeacher);
    return ApiResponse.success(res, 'Classroom modules retrieved', { items: modules });
  } catch (err) {
    next(err);
  }
};

export const updateModule = async (req, res, next) => {
  try {
    const { classId, moduleId } = req.params;
    const mod = await ContentModuleService.updateModule(moduleId, classId, req.body);
    return ApiResponse.success(res, 'Content module updated', { module: mod });
  } catch (err) {
    next(err);
  }
};

export const archiveModule = async (req, res, next) => {
  try {
    const { classId, moduleId } = req.params;
    const mod = await ContentModuleService.archiveModule(moduleId, classId);
    return ApiResponse.success(res, 'Content module archived', { module: mod });
  } catch (err) {
    next(err);
  }
};

export const restoreModule = async (req, res, next) => {
  try {
    const { classId, moduleId } = req.params;
    const mod = await ContentModuleService.restoreModule(moduleId, classId);
    return ApiResponse.success(res, 'Content module restored', { module: mod });
  } catch (err) {
    next(err);
  }
};
