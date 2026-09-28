// src/database/cli/migrate.ts -> aplica las migraciones pendientes
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

async function main(): Promise<void> {
  logger.info(`Conectando a ${process.env.DB_NAME ?? 'photos_app'} en ${process.env.DB_HOST ?? 'localhost'}...`);
  await AppDataSource.initialize();
  const migrations = await AppDataSource.runMigrations({ transaction: 'all' });

  if (migrations.length === 0) {
    console.log('No hay migraciones pendientes.');
  } else {
    migrations.forEach((migration) => console.log(`Aplicada: ${migration.name}`));
  }

  await AppDataSource.destroy();
}

void main().catch((error) => {
  console.error('Fallo al aplicar migraciones:', error.message);
  process.exit(1);
});
