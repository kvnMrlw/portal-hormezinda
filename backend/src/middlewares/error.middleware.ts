import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { apiResponse } from '../utils/apiResponse';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

type DuplicateKeyError = Error & {
  code?: number;
};

function isDuplicateKeyError(error: Error): boolean {
  return (error as DuplicateKeyError).code === 11000;
}

export function notFoundMiddleware(request: Request, _response: Response, next: NextFunction): void {
  next(new AppError('Recurso nao encontrado', 404));
}

export function errorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): Response {
  const statusCode = error instanceof AppError ? error.statusCode : isDuplicateKeyError(error) ? 409 : 500;
  const message = isDuplicateKeyError(error)
    ? 'Usuario ja cadastrado'
    : statusCode === 500
      ? 'Nao foi possivel concluir a solicitacao'
      : error.message;

  if (env.NODE_ENV !== 'test') {
    console.error(error);
  }

  return response.status(statusCode).json(
    apiResponse(null, {
      success: false,
      message
    })
  );
}
