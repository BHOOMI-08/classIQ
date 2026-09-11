import { z } from 'zod';
import { RECORD_STATUS } from './attendance.constants.js';

export const correctRecordSchema = z.object({
  newStatus: z.enum(Object.values(RECORD_STATUS)),
  reason: z.string().min(5, 'Reason must be at least 5 characters long').max(1000),
  evidence: z.string().max(500).optional().default(''),
});
