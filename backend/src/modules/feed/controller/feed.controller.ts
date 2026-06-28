import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { FeedService } from '../service/feed.service';
import {
  createPostSchema,
  createStorySchema,
  listPostsQuerySchema,
  pinPostSchema,
  postIdParamSchema,
  reactPostSchema
} from '../validation/feed.validation';

const feedService = new FeedService();

function fileToImage(file?: Express.Multer.File) {
  if (!file) {
    return undefined;
  }

  return {
    url: `/uploads/feed/${file.filename}`,
    alt: file.originalname,
    tipo: file.mimetype
  };
}

export async function listPosts(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedQuery = listPostsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar as publicacoes', 400);
    }

    const feed = await feedService.listPosts(request.user.id, parsedQuery.data);

    return response.status(200).json(apiResponse(feed));
  } catch (error) {
    return next(error);
  }
}

export async function createPost(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedBody = createPostSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar a publicacao', 400);
    }

    const image = fileToImage(request.file);
    const hasText = Boolean(parsedBody.data.texto);

    if (!hasText && !image) {
      throw new AppError('Informe texto ou imagem para publicar', 400);
    }

    const post = await feedService.createPost(request.user.id, {
      texto: parsedBody.data.texto,
      imagem: image
    });

    return response.status(201).json(apiResponse({ publicacao: post }, { message: 'Publicacao criada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function reactToPost(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = postIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Publicacao nao encontrada', 404);
    }

    const parsedBody = reactPostSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel reagir a publicacao', 400);
    }

    const post = await feedService.reactToPost(parsedParams.data.id, request.user.id, parsedBody.data.emoji);

    if (!post) {
      throw new AppError('Publicacao nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ publicacao: post }, { message: 'Reacao registrada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function pinPost(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = postIdParamSchema.safeParse(request.params);
    const parsedBody = pinPostSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel fixar a publicacao', 400);
    }

    const post = await feedService.setPostPinned(parsedParams.data.id, request.user.id, parsedBody.data.fixado);

    if (!post) {
      throw new AppError('Publicacao nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ publicacao: post }, { message: 'Publicacao atualizada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function deletePost(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = postIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Publicacao nao encontrada', 404);
    }

    const deleted = await feedService.deletePost(parsedParams.data.id, request.user);

    if (!deleted) {
      throw new AppError('Publicacao nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Publicacao excluida com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function listStories(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const stories = await feedService.listStories(request.user.id);

    return response.status(200).json(apiResponse({ stories }));
  } catch (error) {
    return next(error);
  }
}

export async function createStory(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedBody = createStorySchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar o story', 400);
    }

    const image = fileToImage(request.file);
    const hasText = Boolean(parsedBody.data.texto);

    if (!hasText && !image) {
      throw new AppError('Informe imagem ou texto para criar o story', 400);
    }

    const story = await feedService.createStory(request.user.id, {
      tipo: parsedBody.data.tipo,
      texto: parsedBody.data.texto,
      imagem: image,
      fundo: parsedBody.data.fundo
    });

    return response.status(201).json(apiResponse({ story }, { message: 'Story criado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function viewStory(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = postIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Story nao encontrado', 404);
    }

    const story = await feedService.markStoryAsViewed(parsedParams.data.id, request.user.id);

    if (!story) {
      throw new AppError('Story nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ story }, { message: 'Story visualizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
