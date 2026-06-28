import { z } from 'zod';

import { Cargo, Sexo, Turma, Turno, turmasPorTurno } from '../types/user.types';

const usuarioRegex = /^(?=.*[a-z])(?=.*\.)[a-z0-9.]{8,}$/;
const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const adminAssignableCargoSchema = z
  .nativeEnum(Cargo)
  .refine((cargo) => cargo !== Cargo.GREMIO, 'Use a promocao para adicionar aluno ao Gremio');

function parseBirthDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  if (!isoDateRegex.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date > today
  ) {
    return undefined;
  }

  return date;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

const birthDateSchema = z
  .string()
  .optional()
  .transform((value) => parseBirthDate(value));

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Id do usuario e obrigatorio')
});

export const updateProfileSchema = z.object({
  bio: z.string().trim().max(280, 'A bio deve ter no maximo 280 caracteres').optional(),
  redeSocial: z.string().trim().max(120, 'A rede social deve ter no maximo 120 caracteres').optional(),
  senhaAtual: z.string().optional(),
  novaSenha: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Senha deve ter minimo 8 caracteres, com pelo menos 1 letra e 1 numero')
    .optional(),
  confirmarSenha: z.string().optional()
});

export const adminCreateUserSchema = z
  .object({
    nomeCompleto: z.string().trim().min(3, 'Informe o nome completo'),
    dataNascimento: z
      .string()
      .optional()
      .transform((value) => parseBirthDate(value)),
    usuario: z
      .string()
      .trim()
      .toLowerCase()
      .regex(usuarioRegex, 'Usuario deve ter minimo 8 caracteres, letras e ponto'),
    senha: z.string().regex(senhaRegex, 'Senha deve ter minimo 8 caracteres, com letras e numeros'),
    cargo: adminAssignableCargoSchema,
    sexo: z.nativeEnum(Sexo),
    materia: z.string().trim().max(80).optional(),
    turno: z.nativeEnum(Turno).optional(),
    turma: z.nativeEnum(Turma).optional()
  })
  .superRefine((data, context) => {
    if (data.cargo === Cargo.PROFESSOR && !data.materia) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a materia do professor',
        path: ['materia']
      });
    }

    if (data.cargo === Cargo.ALUNO && (!data.turno || !data.turma)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe turno e turma do aluno',
        path: ['turma']
      });
    }

    if (data.turno && data.turma && !turmasPorTurno[data.turno].includes(data.turma)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Turma nao pertence ao turno selecionado',
        path: ['turma']
      });
    }
  });

export const adminUpdateUserSchema = z
  .object({
    usuario: z
      .string()
      .trim()
      .toLowerCase()
      .regex(usuarioRegex, 'Usuario deve ter minimo 8 caracteres, letras e ponto')
      .optional(),
    senha: z.string().regex(senhaRegex, 'Senha deve ter minimo 8 caracteres, com letras e numeros').optional(),
    cargo: adminAssignableCargoSchema.optional(),
    sexo: z.nativeEnum(Sexo).optional(),
    materia: z.string().trim().max(80).optional(),
    ativo: z.preprocess(parseBoolean, z.boolean().optional()),
    dataNascimento: birthDateSchema,
    turno: z.nativeEnum(Turno).optional(),
    turma: z.nativeEnum(Turma).optional()
  })
  .superRefine((data, context) => {
    if (data.cargo === Cargo.PROFESSOR && data.materia === '') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a materia do professor',
        path: ['materia']
      });
    }

    if (data.turno && data.turma && !turmasPorTurno[data.turno].includes(data.turma)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Turma nao pertence ao turno selecionado',
        path: ['turma']
      });
    }
  });
