import { z } from 'zod';

import { Turno, Turma, turmasPorTurno } from '../../users/types/user.types';

const usuarioRegex = /^[a-z0-9.]{8,}$/;
const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

function parseBirthDate(value: string): Date | null {
  if (!isoDateRegex.test(value)) {
    return null;
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
    return null;
  }

  return date;
}

export const registerSchema = z
  .object({
    nomeCompleto: z.string().trim().min(3, 'Informe o nome completo'),
    usuario: z
      .string()
      .trim()
      .regex(usuarioRegex, 'Usuario deve ter minimo 8 caracteres e conter apenas letras minusculas, numeros e ponto'),
    senha: z
      .string()
      .regex(senhaRegex, 'Senha deve ter minimo 8 caracteres, com pelo menos 1 letra e 1 numero'),
    dataNascimento: z
      .string()
      .refine((value) => parseBirthDate(value) !== null, 'Data de nascimento invalida')
      .transform((value) => parseBirthDate(value) as Date),
    turno: z.nativeEnum(Turno),
    turma: z.nativeEnum(Turma)
  })
  .superRefine((data, context) => {
    if (!turmasPorTurno[data.turno].includes(data.turma)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Turma nao pertence ao turno selecionado',
        path: ['turma']
      });
    }
  });

export const loginSchema = z.object({
  usuario: z.string().trim().min(1, 'Informe o usuario'),
  senha: z.string().min(1, 'Informe a senha')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
