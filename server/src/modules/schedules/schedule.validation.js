import { z } from 'zod';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const scheduleObject = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format'),
  roomNumber: z.string().max(50).optional().default(''),
  timezone: z.string().optional().default('UTC'),
});

const validateTimeOrder = (data) => {
  if (!data.startTime || !data.endTime) return true;
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  return endH * 60 + endM > startH * 60 + startM;
};

export const createScheduleSchema = scheduleObject.refine(validateTimeOrder, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateScheduleSchema = scheduleObject.partial().refine(validateTimeOrder, {
  message: 'End time must be after start time',
  path: ['endTime'],
});
