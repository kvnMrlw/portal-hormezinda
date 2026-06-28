import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { NotificationService } from '../service/notification.service';
import { notificationIdParamSchema, notificationListQuerySchema } from '../validation/notification.validation';

const notificationService = new NotificationService();

export async function listNotifications(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedQuery = notificationListQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar as notificacoes', 400);
    }

    const notifications = await notificationService.list(request.user.id, parsedQuery.data);

    return response.status(200).json(apiResponse(notifications));
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationAsRead(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = notificationIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Notificacao nao encontrada', 404);
    }

    const notification = await notificationService.markAsRead(parsedParams.data.id, request.user);

    if (!notification) {
      throw new AppError('Notificacao nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ notificacao: notification }, { message: 'Notificacao marcada como lida' }));
  } catch (error) {
    return next(error);
  }
}

export async function markAllNotificationsAsRead(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    await notificationService.markAllAsRead(request.user);

    return response.status(200).json(apiResponse({ ok: true }, { message: 'Notificacoes marcadas como lidas' }));
  } catch (error) {
    return next(error);
  }
}
