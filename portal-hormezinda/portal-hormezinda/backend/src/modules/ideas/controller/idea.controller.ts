import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { removeUploadedFiles, saveUploadedFile } from '../../../utils/imageUpload';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { IdeaService } from '../service/idea.service';
import type { IdeaImage } from '../types/idea.types';
import { ideaAdminPayloadSchema, ideaFiltersSchema, ideaIdParamSchema, ideaPayloadSchema, ideaReactionSchema } from '../validation/idea.validation';

const ideaService = new IdeaService();

async function fileToIdeaImage(file?: Express.Multer.File): Promise<IdeaImage | undefined> {
  if (!file) {
    return undefined;
  }

  const [image, thumbnail] = await Promise.all([
    saveUploadedFile(file, { folderName: 'ideas', imageVariant: 'feed' }),
    saveUploadedFile(file, { folderName: 'ideas', imageVariant: 'menuThumb' })
  ]);

  return {
    alt: image.originalName,
    nome: image.originalName,
    tamanho: image.size,
    thumbnailUrl: thumbnail.publicUrl,
    tipo: image.mimeType,
    url: image.publicUrl
  };
}

export async function listIdeas(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedQuery = ideaFiltersSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar as ideias', 400);
    }

    const ideas = await ideaService.list(request.user.id, parsedQuery.data);

    return response.status(200).json(apiResponse(ideas));
  } catch (error) {
    return next(error);
  }
}

export async function listUserIdeas(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = ideaIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    const ideias = await ideaService.listByAuthor(parsedParams.data.id, request.user.id);

    return response.status(200).json(apiResponse({ ideias }));
  } catch (error) {
    return next(error);
  }
}

export async function createIdea(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const image = await fileToIdeaImage(request.file);

  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedBody = ideaPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar a ideia', 400);
    }

    const idea = await ideaService.create(request.user, parsedBody.data, image);

    return response.status(201).json(apiResponse({ ideia: idea }, { message: 'Ideia criada com sucesso' }));
  } catch (error) {
    await removeUploadedFiles([image?.url, image?.thumbnailUrl]);
    return next(error);
  }
}

export async function updateIdea(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const image = await fileToIdeaImage(request.file);

  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = ideaIdParamSchema.safeParse(request.params);
    const parsedBody = ideaPayloadSchema.partial().safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar a ideia', 400);
    }

    const idea = await ideaService.update(parsedParams.data.id, request.user, parsedBody.data, image);

    if (!idea) {
      throw new AppError('Ideia nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ ideia: idea }, { message: 'Ideia atualizada com sucesso' }));
  } catch (error) {
    await removeUploadedFiles([image?.url, image?.thumbnailUrl]);
    return next(error);
  }
}

export async function updateIdeaAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = ideaIdParamSchema.safeParse(request.params);
    const parsedBody = ideaAdminPayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar a administracao da ideia', 400);
    }

    const idea = await ideaService.updateAdmin(parsedParams.data.id, request.user, parsedBody.data);

    if (!idea) {
      throw new AppError('Ideia nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ ideia: idea }, { message: 'Ideia atualizada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function toggleIdeaSupport(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = ideaIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Ideia nao encontrada', 404);
    }

    const idea = await ideaService.toggleSupport(parsedParams.data.id, request.user);

    if (!idea) {
      throw new AppError('Ideia nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ ideia: idea }, { message: 'Apoio atualizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function reactToIdea(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = ideaIdParamSchema.safeParse(request.params);
    const parsedBody = ideaReactionSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel reagir a ideia', 400);
    }

    const idea = await ideaService.react(parsedParams.data.id, request.user, parsedBody.data.emoji);

    if (!idea) {
      throw new AppError('Ideia nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ ideia: idea }, { message: 'Reacao registrada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function deleteIdea(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = ideaIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Ideia nao encontrada', 404);
    }

    const deleted = await ideaService.delete(parsedParams.data.id, request.user);

    if (!deleted) {
      throw new AppError('Ideia nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Ideia excluida com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
