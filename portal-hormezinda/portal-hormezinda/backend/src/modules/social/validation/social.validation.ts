import { z } from 'zod';

import { birthdayMessages } from '../types/social.types';

export const birthdayMessagePayloadSchema = z.object({
  mensagem: z.enum(birthdayMessages)
});

export const birthdayUserParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido')
});
