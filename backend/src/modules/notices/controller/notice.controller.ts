import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { removeUploadedFiles, saveUploadedFile } from '../../../utils/imageUpload';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { Cargo } from '../../users/types/user.types';
import { NoticeService, type NoticeAttachment } from '../service/notice.service';
import {
  createNoticeSchema,
  listNoticesQuerySchema,
  noticeIdParamSchema,
  updateNoticeSchema
} from '../validation/notice.validation';

const noticeService = new NoticeService();

async function filesToAttachments(files?: Express.Multer.File[]): Promise<NoticeAttachment[]> {
  return Promise.all(
    (files ?? []).map(async (file) => {
      const savedFile = await saveUploadedFile(file, {
        folderName: 'notices',
        imageVariant: 'notice'
      });

      return {
        url: savedFile.publicUrl,
        nome: savedFile.originalName,
        tipo: savedFile.mimeType,
        tamanho: savedFile.size
      };
    })
  );
}

export async function listNotices(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedQuery = listNoticesQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar os avisos', 400);
    }

    const isAdmin = request.user?.cargo === Cargo.ADMIN;
    const notices = await noticeService.list({
      ...parsedQuery.data,
      includeInactive: isAdmin,
      includeScheduled: isAdmin
    });

    return response.status(200).json(apiResponse({ avisos: notices }));
  } catch (error) {
    return next(error);
  }
}

export async function createNotice(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedBody = createNoticeSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar o aviso', 400);
    }

    const anexos = await filesToAttachments(request.files as Express.Multer.File[] | undefined);

    try {
      const notice = await noticeService.create(request.user.id, {
        ...parsedBody.data,
        anexos
      });

      return response.status(201).json(apiResponse({ aviso: notice }, { message: 'Aviso criado com sucesso' }));
    } catch (error) {
      await removeUploadedFiles(anexos.map((attachment) => attachment.url));
      throw error;
    }
  } catch (error) {
    return next(error);
  }
}

export async function updateNotice(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = noticeIdParamSchema.safeParse(request.params);
    const parsedBody = updateNoticeSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar o aviso', 400);
    }

    const anexos = await filesToAttachments(request.files as Express.Multer.File[] | undefined);

    try {
      const notice = await noticeService.update(parsedParams.data.id, request.user, {
        ...parsedBody.data,
        anexos
      });

      if (!notice) {
        throw new AppError('Aviso nao encontrado', 404);
      }

      return response.status(200).json(apiResponse({ aviso: notice }, { message: 'Aviso atualizado com sucesso' }));
    } catch (error) {
      await removeUploadedFiles(anexos.map((attachment) => attachment.url));
      throw error;
    }
  } catch (error) {
    return next(error);
  }
}

export async function deleteNotice(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = noticeIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Aviso nao encontrado', 404);
    }

    const deleted = await noticeService.delete(parsedParams.data.id, request.user);

    if (!deleted) {
      throw new AppError('Aviso nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Aviso excluido com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
