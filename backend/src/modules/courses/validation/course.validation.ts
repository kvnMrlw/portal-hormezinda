import { z } from 'zod';

import { CourseContentType, CourseStatus, CourseType } from '../types/course.types';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido');

export const courseIdParamSchema = z.object({
  id: objectIdSchema
});

export const courseFiltersSchema = z.object({
  categoria: z.string().trim().max(80).optional(),
  professorId: objectIdSchema.optional(),
  search: z.string().trim().max(80).optional(),
  status: z.nativeEnum(CourseStatus).optional(),
  tipo: z.nativeEnum(CourseType).optional()
});

const contentSchema = z
  .object({
    titulo: z.string().trim().min(2).max(120),
    tipo: z.nativeEnum(CourseContentType),
    texto: z.string().trim().max(5000).optional(),
    link: z.string().trim().url().or(z.literal('')).optional(),
    ordem: z.coerce.number().int().min(0).default(0)
  })
  .superRefine((data, context) => {
    if (data.tipo === CourseContentType.TEXT && !data.texto?.trim()) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o texto do conteudo', path: ['texto'] });
    }

    if (data.tipo === CourseContentType.LINK && !data.link?.trim()) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o link do conteudo', path: ['link'] });
    }
  });

export const coursePayloadSchema = z.object({
  categoria: z.string().trim().min(2).max(80),
  conteudos: z
    .preprocess((value) => {
      if (typeof value !== 'string') {
        return value;
      }

      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }, z.array(contentSchema).default([]))
    .optional(),
  descricao: z.string().trim().min(8).max(1400),
  link: z.string().trim().url().or(z.literal('')).optional(),
  professorId: objectIdSchema,
  status: z.nativeEnum(CourseStatus).default(CourseStatus.DRAFT),
  tipo: z.nativeEnum(CourseType).default(CourseType.COURSE),
  titulo: z.string().trim().min(3).max(140)
});
