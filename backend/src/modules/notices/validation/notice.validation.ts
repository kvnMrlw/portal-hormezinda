import { z } from 'zod';

import { NoticeCategory, NoticePriority } from '../types/notice.types';

function parseDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

function parseStringList(value: unknown): string[] | undefined {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value) as unknown;

      if (Array.isArray(parsedValue)) {
        return parsedValue.map(String).filter(Boolean);
      }
    } catch {
      return value ? [value] : undefined;
    }

    return value ? [value] : undefined;
  }

  return undefined;
}

const booleanSchema = z.preprocess(parseBoolean, z.boolean());
const optionalBooleanSchema = z.preprocess(parseBoolean, z.boolean().optional());
const optionalDateSchema = z
  .string()
  .optional()
  .transform((value) => parseDate(value));
const optionalEndDateSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (value === '') {
      return null;
    }

    return parseDate(value);
  });

const noticeBaseSchema = z
  .object({
    titulo: z.string().trim().min(3, 'Informe o titulo').max(120, 'Titulo deve ter no maximo 120 caracteres'),
    descricao: z.string().trim().min(3, 'Informe a descricao').max(2000, 'Descricao deve ter no maximo 2000 caracteres'),
    categoria: z.nativeEnum(NoticeCategory),
    prioridade: z.nativeEnum(NoticePriority),
    fixado: booleanSchema.default(false),
    ativo: booleanSchema.default(true),
    dataInicio: z
      .string()
      .optional()
      .transform((value) => parseDate(value) ?? new Date()),
    dataFim: optionalEndDateSchema
  })
  .superRefine((data, context) => {
    if (data.dataFim && data.dataFim < data.dataInicio) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Data final deve ser posterior a data de inicio',
        path: ['dataFim']
      });
    }
  });

export const createNoticeSchema = noticeBaseSchema;

export const updateNoticeSchema = z
  .object({
    titulo: z.string().trim().min(3, 'Informe o titulo').max(120, 'Titulo deve ter no maximo 120 caracteres').optional(),
    descricao: z
      .string()
      .trim()
      .min(3, 'Informe a descricao')
      .max(2000, 'Descricao deve ter no maximo 2000 caracteres')
      .optional(),
    categoria: z.nativeEnum(NoticeCategory).optional(),
    prioridade: z.nativeEnum(NoticePriority).optional(),
    fixado: optionalBooleanSchema,
    ativo: optionalBooleanSchema,
    dataInicio: optionalDateSchema,
    dataFim: optionalEndDateSchema,
    removerAnexos: z.preprocess(parseStringList, z.array(z.string()).optional())
  })
  .superRefine((data, context) => {
    if (data.dataInicio && data.dataFim && data.dataFim < data.dataInicio) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Data final deve ser posterior a data de inicio',
        path: ['dataFim']
      });
    }
  });

export const listNoticesQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  categoria: z.nativeEnum(NoticeCategory).optional(),
  prioridade: z.nativeEnum(NoticePriority).optional(),
  fixado: optionalBooleanSchema,
  ativo: optionalBooleanSchema,
  expirado: optionalBooleanSchema
});

export const noticeIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Id do aviso e obrigatorio')
});
