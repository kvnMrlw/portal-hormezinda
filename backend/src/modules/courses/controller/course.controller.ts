import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { removeUploadedFiles, saveUploadedFile } from '../../../utils/imageUpload';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { Cargo } from '../../users/types/user.types';
import { hasRole } from '../../auth/permissions/roles';
import { CourseService } from '../service/course.service';
import type { CourseAsset, CourseCover } from '../types/course.types';
import { courseFiltersSchema, courseIdParamSchema, coursePayloadSchema } from '../validation/course.validation';

const courseService = new CourseService();
const institutionalRoles = [Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR, Cargo.PROFESSOR, Cargo.GREMIO];

type CourseFiles = {
  capa?: Express.Multer.File[];
  arquivos?: Express.Multer.File[];
};

function getUploadedFiles(request: AuthenticatedRequest): CourseFiles {
  return (request.files ?? {}) as CourseFiles;
}

async function fileToAsset(file: Express.Multer.File): Promise<CourseAsset> {
  const asset = await saveUploadedFile(file, { folderName: 'courses', imageVariant: 'notice' });

  return {
    nome: asset.originalName,
    tamanho: asset.size,
    tipo: asset.mimeType,
    url: asset.publicUrl
  };
}

async function fileToCover(file?: Express.Multer.File): Promise<CourseCover | undefined> {
  if (!file) {
    return undefined;
  }

  const asset = await saveUploadedFile(file, { folderName: 'courses', imageVariant: 'menu' });

  return {
    alt: asset.originalName,
    nome: asset.originalName,
    tamanho: asset.size,
    tipo: asset.mimeType,
    url: asset.publicUrl
  };
}

export async function listCourses(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedQuery = courseFiltersSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar os cursos', 400);
    }

    const cursos = await courseService.list({
      ...parsedQuery.data,
      includeHidden: request.user.cargo === Cargo.ADMIN,
      ownerId: hasRole(request.user.cargo, institutionalRoles) || request.user.pertenceGremio ? request.user.id : undefined
    });

    return response.status(200).json(apiResponse({ cursos }));
  } catch (error) {
    return next(error);
  }
}

export async function createCourse(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const files = getUploadedFiles(request);
  const cover = await fileToCover(files.capa?.[0]);
  const assets = await Promise.all((files.arquivos ?? []).map(fileToAsset));

  try {
    const parsedBody = coursePayloadSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar o curso', 400);
    }

    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const curso = await courseService.create(request.user, parsedBody.data, cover, assets);

    return response.status(201).json(apiResponse({ curso }, { message: 'Curso criado com sucesso' }));
  } catch (error) {
    await removeUploadedFiles([cover?.url, ...assets.map((asset) => asset.url)]);
    return next(error);
  }
}

export async function updateCourse(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const files = getUploadedFiles(request);
  const cover = await fileToCover(files.capa?.[0]);
  const assets = await Promise.all((files.arquivos ?? []).map(fileToAsset));

  try {
    const parsedParams = courseIdParamSchema.safeParse(request.params);
    const parsedBody = coursePayloadSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar o curso', 400);
    }

    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const curso = await courseService.update(parsedParams.data.id, request.user, parsedBody.data, cover, assets);

    if (!curso) {
      throw new AppError('Curso nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ curso }, { message: 'Curso atualizado com sucesso' }));
  } catch (error) {
    await removeUploadedFiles([cover?.url, ...assets.map((asset) => asset.url)]);
    return next(error);
  }
}

export async function deleteCourse(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = courseIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Curso nao encontrado', 404);
    }

    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const deleted = await courseService.delete(parsedParams.data.id, request.user);

    if (!deleted) {
      throw new AppError('Curso nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Curso excluido com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
