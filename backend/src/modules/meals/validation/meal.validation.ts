import { z } from 'zod';

import { Weekday } from '../../schedules/types/schedule.types';
import { MealCategory, MealStatus } from '../types/meal.types';

export const mealIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido')
});

export const mealPayloadSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  descricao: z.string().trim().min(2).max(800),
  diaSemana: z.nativeEnum(Weekday),
  categoria: z.nativeEnum(MealCategory).default(MealCategory.SNACK),
  status: z.nativeEnum(MealStatus).default(MealStatus.PUBLISHED)
});

export const mealFiltersSchema = z.object({
  categoria: z.nativeEnum(MealCategory).optional(),
  diaSemana: z.nativeEnum(Weekday).optional(),
  search: z.string().trim().max(80).optional(),
  status: z.nativeEnum(MealStatus).optional()
});
