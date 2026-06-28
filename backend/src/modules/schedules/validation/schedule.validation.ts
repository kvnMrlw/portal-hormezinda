import { z } from 'zod';

import { Turma } from '../../users/types/user.types';
import { ScheduleEntryKind, Weekday } from '../types/schedule.types';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);

  return hours * 60 + minutes;
}

export const scheduleIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Id do horario e obrigatorio')
});

export const scheduleFiltersSchema = z.object({
  diaSemana: z.nativeEnum(Weekday).optional(),
  disciplina: z.string().trim().max(80).optional(),
  professorId: z.string().regex(/^[a-f\d]{24}$/i, 'Professor invalido').optional(),
  search: z.string().trim().max(80).optional(),
  turma: z.nativeEnum(Turma).optional()
});

export const schedulePayloadSchema = z
  .object({
    cor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Informe uma cor valida'),
    diaSemana: z.nativeEnum(Weekday),
    disciplina: z.string().trim().min(2, 'Informe a disciplina').max(80),
    horarioFim: z.string().regex(timeRegex, 'Informe o horario final'),
    horarioInicio: z.string().regex(timeRegex, 'Informe o horario inicial'),
    observacao: z.string().trim().max(240).optional(),
    professorId: z.string().regex(/^[a-f\d]{24}$/i, 'Professor invalido').optional(),
    sala: z.string().trim().max(40).optional(),
    tipo: z.nativeEnum(ScheduleEntryKind).default(ScheduleEntryKind.LESSON),
    turma: z.nativeEnum(Turma).optional()
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
      if (!data.professorId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe o professor',
          path: ['professorId']
        });
      }

      if (!data.turma) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe a turma',
          path: ['turma']
        });
      }

      if (!data.sala) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe a sala',
          path: ['sala']
        });
      }
    }
  });
