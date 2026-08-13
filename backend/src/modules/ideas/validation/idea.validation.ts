import { z } from 'zod';

import { reactionEmojis } from '../../feed/types/feed.types';
import { IdeaCategory, IdeaStatus } from '../types/idea.types';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido');

export const ideaIdParamSchema = z.object({
  id: objectIdSchema
});

export const ideaFiltersSchema = z.object({
  categoria: z.nativeEnum(IdeaCategory).optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(['recentes', 'apoiadas']).default('recentes'),
  status: z.nativeEnum(IdeaStatus).optional()
});

export const ideaPayloadSchema = z.object({
  categoria: z.nativeEnum(IdeaCategory),
  descricao: z.string().trim().min(8).max(2000),
  titulo: z.string().trim().min(3).max(120)
});

export const ideaAdminPayloadSchema = z.object({
  destaque: z.coerce.boolean().optional(),
  respostaOficial: z.string().trim().max(1200).optional(),
  status: z.nativeEnum(IdeaStatus).optional()
});

export const ideaReactionSchema = z.object({
  emoji: z.enum(reactionEmojis)
});
