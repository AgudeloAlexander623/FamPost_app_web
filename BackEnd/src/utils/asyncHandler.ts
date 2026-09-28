// src/utils/asyncHandler.ts -> envuelve controladores async para que Express
// envíe los rechazos al errorMiddleware (Express 4 no los captura solo).
import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
