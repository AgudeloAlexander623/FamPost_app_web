// src/routes/index.ts -> rutas de la API
import { Router } from 'express';

import { authRouter } from './auth.routes';
import { healthRouter } from './health.routes';
import { photoRouter } from './photo.routes';

export const router: Router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/photos', photoRouter);
