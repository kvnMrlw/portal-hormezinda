import { z } from 'zod';

import { ScheduleEntryKind, Weekday } from '../types/schedule.types';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido');

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);

  return hours * 60 + minutes;
}

export const scheduleIdParamSchema = z.object({
  id: objectIdSchema
});

export const scheduleFiltersSchema = z.object({
  diaSemana: z.nativeEnum(Weekday).optional(),
  disciplinaId: objectIdSchema.optional(),
  professorId: objectIdSchema.optional(),
  salaId: objectIdSchema.optional(),
  search: z.string().trim().max(80).optional(),
  turmaId: objectIdSchema.optional()
});

export const schedulePayloadSchema = z
  .object({
    diaSemana: z.nativeEnum(Weekday),
    disciplinaId: objectIdSchema.optional(),
    horarioFim: z.string().regex(timeRegex, 'Informe o horario final'),
    horarioInicio: z.string().regex(timeRegex, 'Informe o horario inicial'),
    observacao: z.string().trim().max(240).optional(),
    ordem: z.coerce.number().int().min(0).optional(),
    professorId: objectIdSchema.optional(),
    salaId: objectIdSchema.optional(),
    tipo: z.nativeEnum(ScheduleEntryKind).default(ScheduleEntryKind.LESSON),
    turmaId: objectIdSchema
  })
  .superRefine((data, context) => {
    if (toMinutes(data.horarioFim) <= toMinutes(data.horarioInicio)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Horario final deve ser posterior ao inicial',
        path: ['horarioFim']
      });
    }

    if (data.tipo === ScheduleEntryKind.LESSON) {
      if (!data.disciplinaId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe a disciplina',
          path: ['disciplinaId']
        });
      }

      if (!data.professorId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe o professor',
          path: ['professorId']
        });
      }

      if (!data.salaId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe a sala',
          path: ['salaId']
        });
      }
    }
  });

export const copyWeekPayloadSchema = z.object({
  origemTurmaId: objectIdSchema,
  sobrescrever: z.coerce.boolean().optional(),
  destinoTurmaId: objectIdSchema
});

export const reorderSchedulePayloadSchema = z.object({
  diaSemana: z.nativeEnum(Weekday),
  ids: z.array(objectIdSchema),
  turmaId: objectIdSchema
});
