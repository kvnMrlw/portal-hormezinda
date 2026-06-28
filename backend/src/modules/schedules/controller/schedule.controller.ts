import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { ScheduleService } from '../service/schedule.service';
import { scheduleFiltersSchema, scheduleIdParamSchema, schedulePayloadSchema } from '../validation/schedule.validation';

const scheduleService = new ScheduleService();

export async function listSchedules(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedQuery = scheduleFiltersSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar os horarios', 400);
    }

    const horarios = await scheduleService.list(request.user, parsedQuery.data);

    return response.status(200).json(apiResponse({ horarios }));
  } catch (error) {
    return next(error);
  }
}

export async function createSchedule(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = schedulePayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar o horario', 400);
    }

    const horario = await scheduleService.create(parsedBody.data);

    return response.status(201).json(apiResponse({ horario }, { message: 'Horario criado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function updateSchedule(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = scheduleIdParamSchema.safeParse(request.params);
    const parsedBody = schedulePayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar o horario', 400);
    }

    const horario = await scheduleService.update(parsedParams.data.id, parsedBody.data);

    if (!horario) {
      throw new AppError('Horario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ horario }, { message: 'Horario atualizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function duplicateSchedule(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = scheduleIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Horario nao encontrado', 404);
    }

    const horario = await scheduleService.duplicate(parsedParams.data.id);

    if (!horario) {
      throw new AppError('Horario nao encontrado', 404);
    }

    return response.status(201).json(apiResponse({ horario }, { message: 'Horario duplicado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function deleteSchedule(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = scheduleIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Horario nao encontrado', 404);
    }

    const deleted = await scheduleService.delete(parsedParams.data.id);

    if (!deleted) {
      throw new AppError('Horario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Horario excluido com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
