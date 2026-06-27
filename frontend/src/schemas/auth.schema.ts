import { z } from 'zod';

import { Turno, Turma, turmasPorTurno } from '../types/auth';

const usuarioRegex = /^[a-z0-9.]{8,}$/;
const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const brazilianDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export function normalizeDateInput(value: string): string {
  if (brazilianDateRegex.test(value)) {
    const [day, month, year] = value.split('/');

    return `${year}-${month}-${day}`;
  }

  return value;
}

function isValidBirthDate(value: string): boolean {
  const normalizedValue = normalizeDateInput(value);

  if (!isoDateRegex.test(normalizedValue)) {
    return false;
  }

  const [year, month, day] = normalizedValue.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= today
  );
}

// Schemas Zod utilizados pelos formularios de autenticacao.
export const loginSchema = z.object({
  usuario: z.string().trim().min(1, 'Informe seu usuario'),
  senha: z.string().min(1, 'Informe sua senha')
});

const registerBaseSchema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo'),
  dataNascimento: z
    .string()
    .min(1, 'Informe sua data de nascimento')
    .refine(isValidBirthDate, 'Informe uma data valida, sem datas futuras'),
  turno: z.nativeEnum(Turno, { required_error: 'Selecione seu turno' }),
  turma: z.nativeEnum(Turma, { required_error: 'Selecione sua turma' }),
  usuario: z
    .string()
    .trim()
    .regex(usuarioRegex, 'Use apenas letras minusculas, numeros e ponto, com minimo de 8 caracteres'),
  senha: z
    .string()
    .regex(senhaRegex, 'A senha precisa ter 8 caracteres, 1 letra e 1 numero'),
  confirmarSenha: z.string().min(1, 'Confirme sua senha')
});

export const registerSchema = registerBaseSchema
  .superRefine((data, context) => {
    if (data.senha !== data.confirmarSenha) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As senhas nao conferem',
        path: ['confirmarSenha']
      });
    }

    if (!turmasPorTurno[data.turno].includes(data.turma)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione uma turma do turno escolhido',
        path: ['turma']
      });
    }
  });

export const registerStepOneSchema = registerBaseSchema.pick({
  nomeCompleto: true,
  dataNascimento: true
});

export const registerStepTwoSchema = registerBaseSchema.pick({
  turno: true
});

export const registerStepThreeSchema = registerBaseSchema.pick({
  turno: true,
  turma: true
});

export const registerStepFourSchema = registerBaseSchema.pick({
  nomeCompleto: true,
  dataNascimento: true,
  turno: true,
  turma: true,
  usuario: true,
  senha: true,
  confirmarSenha: true
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
