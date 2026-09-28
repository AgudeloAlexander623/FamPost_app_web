// src/routes/photo.routes.ts
import { Router } from 'express';

import { photoController } from '../controllers/photo.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const photoRouter: Router = Router();

photoRouter.get('/', asyncHandler(photoController.list));
photoRouter.get('/:id', asyncHandler(photoController.getById));
photoRouter.post('/', asyncHandler(photoController.create));
photoRouter.delete('/:id', asyncHandler(photoController.remove));
