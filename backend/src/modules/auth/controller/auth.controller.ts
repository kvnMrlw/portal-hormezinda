import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { AuthService } from '../service/auth.service';
import type { AuthenticatedRequest } from '../types/auth.types';
import { loginSchema, registerSchema } from '../validation/auth.validation';

const authService = new AuthService();

function formatValidationError(error: ZodError): string {
  return error.issues.map((issue) => issue.message).join('; ');
}

export async function register(request: Request, response: Response, next: NextFunction) {
  try {
    const parsedBody = registerSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(formatValidationError(parsedBody.error), 400);
    }

    const result = await authService.register(parsedBody.data);

    return response.status(201).json(apiResponse(result, { message: 'Cadastro realizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function login(request: Request, response: Response, next: NextFunction) {
  try {
    const parsedBody = loginSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(formatValidationError(parsedBody.error), 400);
    }

    const result = await authService.login(parsedBody.data);

    return response.status(200).json(apiResponse(result, { message: 'Login realizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export function me(request: AuthenticatedRequest, response: Response): Response {
  return response.status(200).json(apiResponse({ usuario: request.user }, { message: 'Usuario autenticado' }));
}
