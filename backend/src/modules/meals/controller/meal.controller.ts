import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { removeUploadedFiles, saveUploadedFile } from '../../../utils/imageUpload';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { Cargo } from '../../users/types/user.types';
import { MealService } from '../service/meal.service';
import type { MealImage } from '../types/meal.types';
import { mealFiltersSchema, mealIdParamSchema, mealPayloadSchema } from '../validation/meal.validation';

const mealService = new MealService();

async function fileToMealImage(file?: Express.Multer.File): Promise<MealImage | undefined> {
  if (!file) return undefined;

  const [image, thumbnail] = await Promise.all([
    saveUploadedFile(file, { folderName: 'meals', imageVariant: 'menu' }),
    saveUploadedFile(file, { folderName: 'meals', imageVariant: 'menuThumb' })
  ]);

  return {
    alt: image.originalName,
    thumbnailUrl: thumbnail.publicUrl,
    tipo: image.mimeType,
    url: image.publicUrl
  };
}

export async function listMeals(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedQuery = mealFiltersSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar o cardapio', 400);
    }

    const meals = await mealService.list({
      ...parsedQuery.data,
      includeHidden: request.user.cargo === Cargo.ADMIN
    });

    return response.status(200).json(apiResponse({ refeicoes: meals }));
  } catch (error) {
    return next(error);
  }
}

export async function createMeal(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const image = await fileToMealImage(request.file);

  try {
    const parsedBody = mealPayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar a refeicao', 400);
    }

    if (!image) {
      throw new AppError('Envie uma imagem da refeicao', 400);
    }

    const meal = await mealService.create({ ...parsedBody.data, imagem: image });

    return response.status(201).json(apiResponse({ refeicao: meal }, { message: 'Refeicao criada com sucesso' }));
  } catch (error) {
    await removeUploadedFiles([image?.url, image?.thumbnailUrl]);
    return next(error);
  }
}

export async function updateMeal(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const image = await fileToMealImage(request.file);

  try {
    const parsedParams = mealIdParamSchema.safeParse(request.params);
    const parsedBody = mealPayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar a refeicao', 400);
    }

    const meal = await mealService.update(parsedParams.data.id, parsedBody.data, image);

    if (!meal) {
      throw new AppError('Refeicao nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ refeicao: meal }, { message: 'Refeicao atualizada com sucesso' }));
  } catch (error) {
    await removeUploadedFiles([image?.url, image?.thumbnailUrl]);
    return next(error);
  }
}

export async function deleteMeal(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = mealIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Refeicao nao encontrada', 404);
    }

    const deleted = await mealService.delete(parsedParams.data.id);

    if (!deleted) {
      throw new AppError('Refeicao nao encontrada', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Refeicao excluida com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
