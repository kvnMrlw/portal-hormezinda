import { z } from 'zod';

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
