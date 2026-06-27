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

export function notFoundMiddleware(request: Request, _response: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404));
}

export function errorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): Response {
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  if (env.NODE_ENV !== 'test') {
    console.error(error);
  }

  return response.status(statusCode).json(
    apiResponse(null, {
      success: false,
      message: statusCode === 500 ? 'Internal server error' : error.message,
      error: env.NODE_ENV === 'production' ? undefined : error.name
    })
  );
}
