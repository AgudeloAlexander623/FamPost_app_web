// src/middlewares/notFound.middleware.ts
import { type Request, type Response, type NextFunction } from 'express';

export function notFoundMiddleware(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    statusCode: 404,
    error: 'Not Found',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}
