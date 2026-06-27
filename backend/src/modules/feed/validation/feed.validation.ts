import { z } from 'zod';

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
    .refine((text) => text.length > 0, 'Informe o texto da publicacao')
});

export const postIdParamSchema = z.object({
  id: z.string().min(1, 'Id da publicacao e obrigatorio')
});

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10)
});
