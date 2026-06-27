import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { UserService } from '../service/user.service';
import { updateProfileSchema, userIdParamSchema } from '../validation/user.validation';

const userService = new UserService();

export async function listUsers(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const users = await userService.listActiveUsers(request.user);

    return response.status(200).json(apiResponse({ usuarios: users }));
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = userIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    const user = await userService.findPublicById(parsedParams.data.id, request.user);

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ usuario: user }));
  } catch (error) {
    return next(error);
  }
}

export async function updateCurrentUserProfile(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedBody = updateProfileSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar o perfil', 400);
    }

    const user = await userService.updateProfile(request.user.id, parsedBody.data);

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ usuario: user }, { message: 'Perfil atualizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
