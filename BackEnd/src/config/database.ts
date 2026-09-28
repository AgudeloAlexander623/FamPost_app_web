// src/config/database.ts -> configuracion de PostgreSQL con TypeORM
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { env } from './env';
import { Photo } from '../entities/Photo';
import { InitialSchema1759000000000 } from '../migrations/1759000000000-InitialSchema';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  entities: [Photo],
  migrations: [InitialSchema1759000000000],
  // En produccion nunca se usa synchronize: las tablas se crean con migraciones.
  synchronize: false,
  migrationsRun: false,
  logging: env.db.logging as never,
});

/** Comprueba la conexion con la base de datos. */
export async function checkDatabase(): Promise<boolean> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
