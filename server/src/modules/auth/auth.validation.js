import { z } from 'zod';

export const passwordPolicy = z
  .string()
  .min(10, 'Password must be at least 10 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerStudentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: passwordPolicy,
  studentId: z.string().trim().min(1, 'Student ID is required'),
  rollNumber: z.string().trim().min(1, 'Roll number is required'),
  department: z.string().trim().min(1, 'Department is required'),
  semester: z.string().trim().min(1, 'Semester is required'),
  section: z.string().trim().min(1, 'Section is required'),
  institution: z.string().trim().min(1, 'Institution is required'),
  role: z.string().optional().refine((val) => val !== 'admin', {
    message: 'Public registration for admin role is disabled',
  }),
}).strict();

export const registerTeacherSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: passwordPolicy,
  employeeId: z.string().trim().min(1, 'Employee ID is required'),
  department: z.string().trim().min(1, 'Department is required'),
  designation: z.string().trim().min(1, 'Designation is required'),
  subjects: z.array(z.string().trim()).optional(),
  institution: z.string().trim().min(1, 'Institution is required'),
  role: z.string().optional().refine((val) => val !== 'admin', {
    message: 'Public registration for admin role is disabled',
  }),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberDevice: z.boolean().optional(),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordPolicy,
}).strict();

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: passwordPolicy,
}).strict();

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
}).strict();
