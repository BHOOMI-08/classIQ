import { z } from 'zod';

export const startSessionSchema = z.object({
  title: z.string().max(100).optional().default('Class Attendance'),
  durationMinutes: z.number().int().min(1).max(120).optional().default(10),
  qrRotationSeconds: z.number().int().min(5).max(60).optional().default(15),
  locationRequired: z.boolean().optional().default(false),
  teacherLocation: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracyMeters: z.number().min(0).optional().default(0),
    })
    .optional(),
  geofenceRadiusMeters: z.number().min(10).max(1000).optional().default(100),
  lateAfterMinutes: z.number().min(0).max(120).optional().default(5),
  presenceChallengeEnabled: z.boolean().optional().default(false),
  deviceVerificationEnabled: z.boolean().optional().default(true),
  manualReviewEnabled: z.boolean().optional().default(true),
  scheduleId: z.string().optional(),
});

export const endSessionSchema = z.object({
  reason: z.string().max(500).optional().default('Teacher ended session'),
});
