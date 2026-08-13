import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { SocialService } from '../service/social.service';
import { birthdayMessagePayloadSchema, birthdayUserParamSchema } from '../validation/social.validation';

const socialService = new SocialService();

function getViewer(request: AuthenticatedRequest) {
  if (!request.user) {
    throw new AppError('Usuario nao autenticado', 401);
  }

  return request.user;
}

export async function getTodayBirthdays(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const birthdays = await socialService.getTodayBirthdays(getViewer(request));

    return response.status(200).json(apiResponse(birthdays));
  } catch (error) {
    return next(error);
  }
}

export async function sendBirthdayMessage(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = birthdayUserParamSchema.safeParse(request.params);
    const parsedBody = birthdayMessagePayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel enviar os parabens', 400);
    }

    const mensagem = await socialService.sendBirthdayMessage(getViewer(request), parsedParams.data.id, parsedBody.data.mensagem);

    return response.status(201).json(apiResponse({ mensagem }, { message: 'Parabens enviado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
