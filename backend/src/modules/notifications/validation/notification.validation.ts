import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido');

export const notificationIdParamSchema = z.object({
  id: objectIdSchema
});

export const notificationListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).default(1),
  unreadOnly: z.coerce.boolean().optional()
});
