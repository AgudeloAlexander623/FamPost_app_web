// src/routes/auth.routes.ts
import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const authRouter: Router = Router();

authRouter.post('/login', asyncHandler(authController.login));
