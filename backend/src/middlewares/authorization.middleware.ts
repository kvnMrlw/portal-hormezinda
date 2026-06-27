import type { NextFunction, Response } from 'express';

import { Cargo } from '../models/user.model';
import { hasCargo } from '../services/auth.service';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import { AppError } from './error.middleware';

// Bloqueia acesso quando o cargo do usuario nao esta autorizado.
export function authorizeRoles(...allowedCargos: Cargo[]) {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      return next(new AppError('Usuario nao autenticado', 401));
    }

    if (!hasCargo(request.user.cargo, allowedCargos)) {
      return next(new AppError('Acesso nao autorizado', 403));
    }

    return next();
  };
}
