// src/controllers/auth.controller.ts
import { type Request, type Response } from 'express';

import { securityService } from '../services/security.service';
import { AppError } from '../utils/AppError';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      throw new AppError(400, 'Faltan los campos username y password');
    }

    const result = await securityService.login(username, password);
    res.json(result);
  },
};
