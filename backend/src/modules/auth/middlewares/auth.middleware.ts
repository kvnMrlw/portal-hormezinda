import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../../../config/env';
import { AppError } from '../../../middlewares/error.middleware';
import { AuthService, type JwtPayload } from '../service/auth.service';
import type { AuthenticatedRequest } from '../types/auth.types';

const authService = new AuthService();

export async function authenticate(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Token nao informado', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    request.user = await authService.getAuthenticatedUser(payload.sub);

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError('Token invalido ou expirado', 401));
  }
}
