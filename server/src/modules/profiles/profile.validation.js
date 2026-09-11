import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  department: z.string().trim().min(2).optional(),
  semester: z.string().trim().optional(),
  section: z.string().trim().optional(),
  bio: z.string().trim().max(500, 'Bio max 500 characters').optional(),
}).strict();

export const updateTeacherProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  department: z.string().trim().min(2).optional(),
  designation: z.string().trim().min(2).optional(),
  subjects: z.array(z.string().trim()).optional(),
  bio: z.string().trim().max(500, 'Bio max 500 characters').optional(),
}).strict();

export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to confirm account deactivation'),
}).strict();
