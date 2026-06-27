import type { NextFunction, Response } from 'express';

import { AppError } from '../../../middlewares/error.middleware';
import { hasRole } from '../permissions/roles';
import type { AuthenticatedRequest } from '../types/auth.types';
import { Cargo } from '../../users/types/user.types';

export function authorizeRoles(...allowedCargos: Cargo[]) {
  return (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      return next(new AppError('Usuario nao autenticado', 401));
    }

    if (!hasRole(request.user.cargo, allowedCargos)) {
      return next(new AppError('Acesso nao autorizado', 403));
    }

    return next();
  };
}
