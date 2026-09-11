import { z } from 'zod';

export const joinClassroomSchema = z.object({
  joinCode: z
    .string()
    .trim()
    .min(4, 'Join code is required')
    .max(12)
    .transform((val) => val.toUpperCase()),
});

export const blockStudentSchema = z.object({
  reason: z.string().trim().max(500).optional().default('Blocked by classroom teacher'),
});
