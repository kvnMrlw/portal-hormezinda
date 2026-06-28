import { z } from 'zod';

import { MealCategory, MealStatus } from '../types/meal.types';

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return date;
}

export const mealIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido')
});

export const mealPayloadSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  descricao: z.string().trim().min(2).max(800),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform(parseDateOnly),
  categoria: z.nativeEnum(MealCategory),
  observacoes: z.string().trim().max(500).optional(),
  ingredientes: z.preprocess(parseList, z.array(z.string()).default([])),
  alergenos: z.preprocess(parseList, z.array(z.string()).default([])),
  vegetariano: z.preprocess(parseBoolean, z.boolean().default(false)),
  vegano: z.preprocess(parseBoolean, z.boolean().default(false)),
  semLactose: z.preprocess(parseBoolean, z.boolean().default(false)),
  semGluten: z.preprocess(parseBoolean, z.boolean().default(false)),
  calorias: z.preprocess((value) => (value === '' || value === undefined ? undefined : Number(value)), z.number().min(0).optional()),
  status: z.nativeEnum(MealStatus).default(MealStatus.DRAFT)
});

export const mealFiltersSchema = z.object({
  categoria: z.nativeEnum(MealCategory).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform(parseDateOnly).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((value) => {
    const date = parseDateOnly(value);
    date.setHours(23, 59, 59, 999);
    return date;
  }).optional(),
  search: z.string().trim().max(80).optional(),
  semGluten: z.preprocess(parseBoolean, z.boolean().optional()),
  semLactose: z.preprocess(parseBoolean, z.boolean().optional()),
  status: z.nativeEnum(MealStatus).optional(),
  vegano: z.preprocess(parseBoolean, z.boolean().optional()),
  vegetariano: z.preprocess(parseBoolean, z.boolean().optional())
});
