import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { UserService } from '../service/user.service';
import { userIdParamSchema } from '../validation/user.validation';

const userService = new UserService();

export async function listUsers(_request: Request, response: Response, next: NextFunction) {
  try {
    const users = await userService.listActiveUsers();

    return response.status(200).json(apiResponse({ usuarios: users }));
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(request: Request, response: Response, next: NextFunction) {
  try {
    const parsedParams = userIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    const user = await userService.findPublicById(parsedParams.data.id);

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ usuario: user }));
  } catch (error) {
    return next(error);
  }
}
