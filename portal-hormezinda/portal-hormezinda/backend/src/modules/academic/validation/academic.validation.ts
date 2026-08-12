import { z } from 'zod';

import { AcademicTaskType, AttendanceStatus, SubmissionStatus } from '../types/academic.types';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido');
const optionalDateSchema = z.coerce.date().optional();

export const academicIdParamSchema = z.object({
  id: objectIdSchema
});

export const taskIdParamSchema = z.object({
  taskId: objectIdSchema
});

export const academicFiltersSchema = z.object({
  disciplinaId: objectIdSchema.optional(),
  status: z.string().trim().optional(),
  turmaId: objectIdSchema.optional()
});

export const attendancePayloadSchema = z.object({
  data: optionalDateSchema,
  disciplinaId: objectIdSchema,
  horarioId: objectIdSchema.optional(),
  professorId: objectIdSchema.optional(),
  registros: z.array(
    z.object({
      alunoId: objectIdSchema,
      observacao: z.string().trim().max(240).optional(),
      status: z.nativeEnum(AttendanceStatus)
    })
  ),
  turmaId: objectIdSchema
});

export const lessonContentPayloadSchema = z.object({
  data: optionalDateSchema,
  descricao: z.string().trim().min(2).max(3000),
  disciplinaId: objectIdSchema,
  professorId: objectIdSchema.optional(),
  titulo: z.string().trim().min(2).max(140),
  turmaId: objectIdSchema
});

export const academicTaskPayloadSchema = z.object({
  data: optionalDateSchema,
  dataEntrega: z.coerce.date(),
  descricao: z.string().trim().min(2).max(3000),
  disciplinaId: objectIdSchema,
  professorId: objectIdSchema.optional(),
  tipo: z.nativeEnum(AcademicTaskType),
  titulo: z.string().trim().min(2).max(140),
  turmaId: objectIdSchema
});

export const diaryEntryPayloadSchema = z.object({
  data: optionalDateSchema,
  disciplinaId: objectIdSchema,
  observacoes: z.string().trim().max(2000).optional(),
  professorId: objectIdSchema.optional(),
  turmaId: objectIdSchema
});

export const observationPayloadSchema = z.object({
  alunoId: objectIdSchema.optional(),
  data: optionalDateSchema,
  descricao: z.string().trim().min(2).max(2000),
  diarioId: objectIdSchema.optional(),
  disciplinaId: objectIdSchema,
  professorId: objectIdSchema.optional(),
  turmaId: objectIdSchema
});

export const submissionReviewPayloadSchema = z.object({
  observacaoProfessor: z.string().trim().max(1000).optional(),
  status: z.nativeEnum(SubmissionStatus)
});
