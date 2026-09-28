// src/controllers/health.controller.ts
import { type Request, type Response } from 'express';

import { checkDatabase } from '../config/database';
import { env } from '../config/env';

export const healthController = {
  async check(_req: Request, res: Response): Promise<void> {
    const database = await checkDatabase();

    res.status(database ? 200 : 503).json({
      status: database ? 'ok' : 'degraded',
      service: 'photos-app-backend',
      environment: env.nodeEnv,
      database: database ? 'connected' : 'unavailable',
      timestamp: new Date().toISOString(),
    });
  },
};
