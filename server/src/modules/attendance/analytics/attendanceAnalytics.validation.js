import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    groupBy: z.enum(['day', 'week', 'month', 'session']).optional(),
    period: z.enum(['7d', '30d', 'month', 'prev_month']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const scenarioPayloadSchema = z.object({
  body: z.object({
    futureAttended: z.number().min(0).max(100),
    futureMissed: z.number().min(0).max(100),
  }),
});
