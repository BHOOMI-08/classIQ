import { Schedule } from './schedule.model.js';
import { ApiError } from '../../utils/api-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AUDIT_EVENTS } from '../../constants/audit-events.js';

export const ScheduleService = {
  getSchedules: async (classroomId) => {
    return Schedule.find({ classroomId, isActive: true }).sort({ dayOfWeek: 1, startTime: 1 }).lean();
  },

  createSchedule: async (classroomId, data, user, ipAddress, userAgent) => {
    const existing = await Schedule.findOne({
      classroomId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      isActive: true,
    });

    if (existing) {
      throw ApiError.conflict(`A lecture is already scheduled for ${data.dayOfWeek} at ${data.startTime}`);
    }

    const schedule = await Schedule.create({
      ...data,
      classroomId,
      isActive: true,
    });

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.SCHEDULE_CREATED,
      ipAddress,
      userAgent,
      metadata: { classroomId, scheduleId: schedule._id, dayOfWeek: schedule.dayOfWeek, startTime: schedule.startTime },
    });

    return schedule;
  },

  updateSchedule: async (classroomId, scheduleId, data, user, ipAddress, userAgent) => {
    const schedule = await Schedule.findOne({ _id: scheduleId, classroomId });
    if (!schedule) {
      throw ApiError.notFound('Schedule slot not found');
    }

    Object.assign(schedule, data);
    await schedule.save();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.SCHEDULE_UPDATED,
      ipAddress,
      userAgent,
      metadata: { classroomId, scheduleId: schedule._id },
    });

    return schedule;
  },

  deleteSchedule: async (classroomId, scheduleId, user, ipAddress, userAgent) => {
    const schedule = await Schedule.findOne({ _id: scheduleId, classroomId });
    if (!schedule) {
      throw ApiError.notFound('Schedule slot not found');
    }

    await schedule.deleteOne();

    await AuditService.log({
      userId: user._id,
      event: AUDIT_EVENTS.SCHEDULE_DELETED,
      ipAddress,
      userAgent,
      metadata: { classroomId, scheduleId },
    });

    return { message: 'Schedule slot deleted successfully' };
  },
};
