import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { apiResponse } from '../../../utils/apiResponse';
import { Cargo } from '../types/user.types';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';
import { UserService } from '../service/user.service';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  listPeopleQuerySchema,
  publicProfileQuerySchema,
  updateProfileSchema,
  userIdParamSchema
} from '../validation/user.validation';

const userService = new UserService();

type ProfileFiles = {
  bannerPerfil?: Express.Multer.File[];
  fotoPerfil?: Express.Multer.File[];
};

function profileFileToPath(file?: Express.Multer.File): string | undefined {
  return file ? `/uploads/profile/${file.filename}` : undefined;
}

export async function listUsers(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const users = await userService.listActiveUsers(request.user);

    return response.status(200).json(apiResponse({ usuarios: users }));
  } catch (error) {
    return next(error);
  }
}

export async function adminListUsers(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user || request.user.cargo !== Cargo.ADMIN) {
      throw new AppError('Acesso nao autorizado', 403);
    }

    const users = await userService.adminListUsers();

    return response.status(200).json(apiResponse({ usuarios: users }));
  } catch (error) {
    return next(error);
  }
}

export async function listPeople(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedQuery = listPeopleQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError('Nao foi possivel listar as pessoas', 400);
    }

    const people = await userService.listPeople(request.user, parsedQuery.data);

    return response.status(200).json(apiResponse(people));
  } catch (error) {
    return next(error);
  }
}

export async function getPublicProfile(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = userIdParamSchema.safeParse(request.params);
    const parsedQuery = publicProfileQuerySchema.safeParse(request.query);

    if (!parsedParams.success || !parsedQuery.success) {
      throw new AppError('Perfil nao encontrado', 404);
    }

    const profile = await userService.getPublicProfile(parsedParams.data.id, request.user, parsedQuery.data);

    if (!profile) {
      throw new AppError('Perfil nao encontrado', 404);
    }

    return response.status(200).json(apiResponse(profile));
  } catch (error) {
    return next(error);
  }
}

export async function adminCreateUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedBody = adminCreateUserSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel criar o usuario', 400);
    }

    const files = request.files as ProfileFiles | undefined;
    const fotoPerfil = profileFileToPath(files?.fotoPerfil?.[0]);
    const bannerPerfil = profileFileToPath(files?.bannerPerfil?.[0]);

    const user = await userService.adminCreateUser({
      ...parsedBody.data,
      fotoPerfil: fotoPerfil ?? '',
      bannerPerfil: bannerPerfil ?? '',
      bio: '',
      redeSocial: '',
      ativo: true
    });

    return response.status(201).json(apiResponse({ usuario: user }, { message: 'Usuario criado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdateUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = userIdParamSchema.safeParse(request.params);
    const parsedBody = adminUpdateUserSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar o usuario', 400);
    }

    const files = request.files as ProfileFiles | undefined;
    const fotoPerfil = profileFileToPath(files?.fotoPerfil?.[0]);
    const bannerPerfil = profileFileToPath(files?.bannerPerfil?.[0]);

    const user = await userService.adminUpdateUser(parsedParams.data.id, {
      ...parsedBody.data,
      ...(fotoPerfil ? { fotoPerfil } : {}),
      ...(bannerPerfil ? { bannerPerfil } : {})
    });

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ usuario: user }, { message: 'Usuario atualizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function adminDeleteUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = userIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    const deleted = await userService.adminDeleteUser(parsedParams.data.id);

    if (!deleted) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ id: parsedParams.data.id }, { message: 'Usuario excluido com sucesso' }));
  } catch (error) {
    return next(error);
  }
}

export async function adminPromoteUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    const parsedParams = userIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    const user = await userService.promoteStudentToGremio(parsedParams.data.id);

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ usuario: user }, { message: 'Usuario promovido para Gremio' }));
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedParams = userIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    const user = await userService.findPublicById(parsedParams.data.id, request.user);

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ usuario: user }));
  } catch (error) {
    return next(error);
  }
}

export async function updateCurrentUserProfile(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  try {
    if (!request.user) {
      throw new AppError('Usuario nao autenticado', 401);
    }

    const parsedBody = updateProfileSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError('Nao foi possivel atualizar o perfil', 400);
    }

    const files = request.files as ProfileFiles | undefined;
    const fotoPerfil = profileFileToPath(files?.fotoPerfil?.[0]);
    const bannerPerfil = profileFileToPath(files?.bannerPerfil?.[0]);

    const user = await userService.updateProfile(request.user.id, {
      ...parsedBody.data,
      ...(fotoPerfil ? { fotoPerfil } : {}),
      ...(bannerPerfil ? { bannerPerfil } : {})
    });

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404);
    }

    return response.status(200).json(apiResponse({ usuario: user }, { message: 'Perfil atualizado com sucesso' }));
  } catch (error) {
    return next(error);
  }
}
