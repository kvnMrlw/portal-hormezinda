import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { CatalogService } from '../service/catalog.service';
import { catalogIdParamSchema, classGroupPayloadSchema, roomPayloadSchema, subjectPayloadSchema } from '../validation/catalog.validation';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';

const catalogService = new CatalogService();

export async function listCatalogs(_request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const catalogs = await catalogService.listAll();

    return response.status(200).json(apiResponse(catalogs));
  } catch (error) {
    return next(error);
  }
}

export async function createClassGroup(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = classGroupPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar a turma', 400);
    }

    const turma = await catalogService.createClass(parsedBody.data);

    return response.status(201).json(apiResponse({ turma }, { message: 'Turma criada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function updateClassGroup(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = catalogIdParamSchema.safeParse(request.params);
    const parsedBody = classGroupPayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar a turma', 400);
    }

    const turma = await catalogService.updateClass(parsedParams.data.id, parsedBody.data);

    if (!turma) {
      throw new AppError('Turma nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ turma }, { message: 'Turma atualizada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function deleteClassGroup(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = catalogIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Turma nao encontrada', 404);
    }

    const deleted = await catalogService.deleteClass(parsedParams.data.id);

    if (!deleted) {
      throw new AppError('Turma nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Turma excluida com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function createSubject(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = subjectPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar a disciplina', 400);
    }

    const disciplina = await catalogService.createSubject(parsedBody.data);

    return response.status(201).json(apiResponse({ disciplina }, { message: 'Disciplina criada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function updateSubject(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = catalogIdParamSchema.safeParse(request.params);
    const parsedBody = subjectPayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar a disciplina', 400);
    }

    const disciplina = await catalogService.updateSubject(parsedParams.data.id, parsedBody.data);

    if (!disciplina) {
      throw new AppError('Disciplina nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ disciplina }, { message: 'Disciplina atualizada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function deleteSubject(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = catalogIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Disciplina nao encontrada', 404);
    }

    const deleted = await catalogService.deleteSubject(parsedParams.data.id);

    if (!deleted) {
      throw new AppError('Disciplina nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Disciplina excluida com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function createRoom(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = roomPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar a sala', 400);
    }

    const sala = await catalogService.createRoom(parsedBody.data);

    return response.status(201).json(apiResponse({ sala }, { message: 'Sala criada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function updateRoom(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = catalogIdParamSchema.safeParse(request.params);
    const parsedBody = roomPayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar a sala', 400);
    }

    const sala = await catalogService.updateRoom(parsedParams.data.id, parsedBody.data);

    if (!sala) {
      throw new AppError('Sala nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ sala }, { message: 'Sala atualizada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function deleteRoom(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = catalogIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Sala nao encontrada', 404);
    }

    const deleted = await catalogService.deleteRoom(parsedParams.data.id);

    if (!deleted) {
      throw new AppError('Sala nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Sala excluida com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
