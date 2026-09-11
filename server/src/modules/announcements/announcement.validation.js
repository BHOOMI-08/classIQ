import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  priority: z.enum(['normal', 'important', 'urgent']).optional().default('normal'),
  status: z.enum(['draft', 'published']).optional().default('published'),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();
