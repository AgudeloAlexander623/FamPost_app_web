// src/middlewares/error.middleware.ts -> manejador global de errores
import { type Request, type Response, type NextFunction } from 'express';

import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      error: err.name,
      message: err.message,
      details: err.details,
    });
    return;
  }

  logger.error('Error no controlado', err);
  res.status(500).json({
    statusCode: 500,
    error: 'Internal Server Error',
    message: env.isDevelopment ? err.message : 'Error interno del servidor',
  });
}
