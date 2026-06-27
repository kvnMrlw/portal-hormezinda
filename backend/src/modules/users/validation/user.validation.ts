import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'Id do usuario e obrigatorio')
});
