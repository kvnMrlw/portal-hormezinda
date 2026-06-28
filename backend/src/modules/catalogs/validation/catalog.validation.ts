import { z } from 'zod';

import { Turno } from '../../users/types/user.types';

export const catalogIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Id invalido')
});

export const classGroupPayloadSchema = z.object({
  ano: z.string().trim().min(1).max(20),
  nome: z.string().trim().min(1).max(40),
  observacoes: z.string().trim().max(240).optional(),
  turno: z.nativeEnum(Turno)
});

export const subjectPayloadSchema = z.object({
  cor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Informe uma cor valida'),
  icone: z.string().trim().max(40).default('BookOpen'),
  nome: z.string().trim().min(2).max(80),
  professorPadraoId: z.string().regex(/^[a-f\d]{24}$/i, 'Professor invalido').optional().or(z.literal(''))
});

export const roomPayloadSchema = z.object({
  bloco: z.string().trim().max(40).optional(),
  capacidade: z.coerce.number().int().min(1).max(500),
  nome: z.string().trim().min(1).max(40),
  observacoes: z.string().trim().max(240).optional()
});
