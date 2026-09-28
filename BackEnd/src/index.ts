// src/index.ts -> punto de entrada del servidor
import 'reflect-metadata';

import { app } from './app';
import { AppDataSource } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info(`Base de datos conectada: ${env.db.name} en ${env.db.host}:${env.db.port}`);
  } catch (error) {
    logger.error(`No se pudo conectar con PostgreSQL (${env.db.name} en ${env.db.host}:${env.db.port})`);
    logger.error('El servidor arrancara, pero las rutas que usen la base de datos fallaran.', error);
    logger.error('Ejecuta "npm run db:create && npm run db:migrate" y revisa el .env');
  }

  const server = app.listen(env.port, () => {
    logger.info(`BackEnd escuchando en http://localhost:${env.port} (${env.nodeEnv})`);
    logger.info(`Health check: http://localhost:${env.port}/api/health`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} recibido, cerrando servidor...`);
    server.close(() => {
      void AppDataSource.destroy().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

void bootstrap();
