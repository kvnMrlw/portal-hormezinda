import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'Id do usuario e obrigatorio')
});

export const updateProfileSchema = z.object({
  fotoPerfil: z.string().trim().url('Informe uma URL valida').or(z.literal('')).optional(),
  bannerPerfil: z.string().trim().url('Informe uma URL valida').or(z.literal('')).optional(),
  bio: z.string().trim().max(280, 'A bio deve ter no maximo 280 caracteres').optional(),
  redeSocial: z.string().trim().max(120, 'A rede social deve ter no maximo 120 caracteres').optional()
});
