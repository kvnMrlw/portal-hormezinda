import { z } from 'zod';

import { reactionEmojis, StoryKind } from '../types/feed.types';

function sanitizePostText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const createPostSchema = z.object({
  texto: z
    .string()
    .max(1000, 'A publicacao deve ter no maximo 1000 caracteres')
    .transform(sanitizePostText)
    .optional()
});

export const postIdParamSchema = z.object({
  id: z.string().min(1, 'Id da publicacao e obrigatorio')
});

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10)
});

export const reactPostSchema = z.object({
  emoji: z.enum(reactionEmojis)
});

export const pinPostSchema = z.object({
  fixado: z.coerce.boolean()
});

export const createStorySchema = z.object({
  tipo: z.nativeEnum(StoryKind),
  texto: z
    .string()
    .max(280, 'O story deve ter no maximo 280 caracteres')
    .transform(sanitizePostText)
    .optional(),
  fundo: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Informe uma cor valida')
    .optional()
});
