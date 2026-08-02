import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';

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

function getErrorStatusCode(error: Error): number {
  if (error instanceof AppError) return error.statusCode;
  if (isDuplicateKeyError(error)) return 409;
  if (error.name === 'BSONError') return 400;
  if (error instanceof mongoose.Error.CastError) return 400;
  if (error instanceof mongoose.Error.ValidationError) return 400;
  if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) return 401;
  if (error instanceof multer.MulterError) return 400;
  if (error instanceof ZodError) return 400;

  return 500;
}

function getErrorMessage(error: Error, statusCode: number): string {
  if (isDuplicateKeyError(error)) return 'Registro ja cadastrado';
  if (error.name === 'BSONError') return 'Identificador invalido';
  if (error instanceof mongoose.Error.CastError) return 'Identificador invalido';
  if (error instanceof mongoose.Error.ValidationError) return 'Dados invalidos';
  if (error instanceof jwt.TokenExpiredError) return 'Token expirado';
  if (error instanceof jwt.JsonWebTokenError) return 'Token invalido';
  if (error instanceof multer.MulterError) return 'Falha no upload do arquivo';
  if (error instanceof ZodError) return error.issues.map((issue) => issue.message).join('; ');

  return statusCode === 500 ? 'Nao foi possivel concluir a solicitacao' : error.message;
}

export function notFoundMiddleware(request: Request, _response: Response, next: NextFunction): void {
  next(new AppError('Recurso nao encontrado', 404));
}

export function errorMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): Response | void {
  if (response.headersSent) {
    return;
  }

  const statusCode = getErrorStatusCode(error);
  const message = getErrorMessage(error, statusCode);

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
