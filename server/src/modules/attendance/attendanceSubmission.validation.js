import { z } from 'zod';

export const submitAttendanceSchema = z.object({
  token: z.string().min(10, 'QR token is required'),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracyMeters: z.number().min(0).optional().default(0),
      capturedAt: z.string().optional(),
    })
    .optional(),
  device: z
    .object({
      deviceId: z.string().min(1, 'deviceId is required'),
      platform: z.string().optional().default('web'),
      screenResolution: z.string().optional().default(''),
      deviceSessionId: z.string().optional().default(''),
    })
    .optional(),
  challengeResponse: z
    .object({
      challengeId: z.string(),
      answer: z.string(),
    })
    .optional(),
});
