// src/routes/health.routes.ts
import { Router } from 'express';

import { healthController } from '../controllers/health.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const healthRouter: Router = Router();

healthRouter.get('/', asyncHandler(healthController.check));
