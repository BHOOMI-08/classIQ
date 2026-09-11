import { ScheduleService } from './schedule.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export const getSchedules = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const schedules = await ScheduleService.getSchedules(classroomId);
    ApiResponse.success(res, { schedules }, 'Schedules fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const classroomId = req.params.classId || req.params.id;
    const schedule = await ScheduleService.createSchedule(
      classroomId,
      req.body,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.created(res, { schedule }, 'Schedule slot created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { classId, scheduleId } = req.params;
    const schedule = await ScheduleService.updateSchedule(
      classId,
      scheduleId,
      req.body,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, { schedule }, 'Schedule slot updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const { classId, scheduleId } = req.params;
    const result = await ScheduleService.deleteSchedule(
      classId,
      scheduleId,
      req.user,
      req.ip,
      req.headers['user-agent']
    );
    ApiResponse.success(res, result, 'Schedule slot deleted successfully');
  } catch (error) {
    next(error);
  }
};
