import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { FeedService } from '../service/feed.service';
import { createPostSchema, listPostsQuerySchema, postIdParamSchema } from '../validation/feed.validation';

const feedService = new FeedService();

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

    const post = await feedService.createPost(request.user.id, parsedBody.data.texto);

    return response.status(201).json(apiResponse({ publicacao: post }, { message: 'Publicacao criada com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function likePost(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = postIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Publicacao nao encontrada', 404);
    }

    const post = await feedService.likePost(parsedParams.data.id, request.user.id);

    if (!post) {
      throw new AppError('Publicacao nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ publicacao: post }, { message: 'Publicacao curtida com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
