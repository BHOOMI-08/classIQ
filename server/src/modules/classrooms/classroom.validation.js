import { z } from 'zod';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const scheduleItemSchema = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format'),
  roomNumber: z.string().max(50).optional().default(''),
}).refine(
  (data) => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return endH * 60 + endM > startH * 60 + startM;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export const createClassroomSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
  subjectName: z.string().trim().min(2, 'Subject name must be at least 2 characters').max(100),
  courseCode: z.string().trim().min(2, 'Course code must be at least 2 characters').max(20).transform((val) => val.toUpperCase()),
  department: z.string().trim().min(2, 'Department is required').max(100),
  semester: z.string().trim().min(1, 'Semester is required').max(50),
  section: z.string().trim().min(1, 'Section is required').max(20),
  roomNumber: z.string().trim().max(50).optional().default(''),
  description: z.string().trim().max(1000).optional().default(''),
  institution: z.string().trim().max(100).optional(),
  attendanceThreshold: z.number().min(0).max(100).optional().default(75),
  maximumStudents: z.number().positive().nullable().optional().default(null),
  allowStudentLeave: z.boolean().optional().default(false),
  schedules: z.array(scheduleItemSchema).optional().default([]),
});

export const updateClassroomSchema = createClassroomSchema.partial();
