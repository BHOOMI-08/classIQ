import { z } from 'zod';

export const registerDeviceSchema = z.object({
  deviceId: z.string().min(1, 'deviceId is required'),
  platform: z.string().optional().default('web'),
  label: z.string().optional().default('My Device'),
});
