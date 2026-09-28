// src/database/cli/create-database.ts -> crea la base de datos si no existe
import { Client } from 'pg';

import { env } from '../../config/env';

async function main(): Promise<void> {
  const client = new Client({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: 'postgres',
  });

  try {
    await client.connect();
  } catch (error) {
    console.error(`No se pudo conectar al servidor PostgreSQL en ${env.db.host}:${env.db.port}`);
    console.error(
      'Comprueba que el servidor este levantado (Docker: docker compose up -d db) y que DB_USER/DB_PASSWORD sean correctos.',
    );
    console.error(error);
    process.exit(1);
  }

  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
    env.db.name,
  ]);

  if (rowCount && rowCount > 0) {
    console.log(`La base de datos "${env.db.name}" ya existe.`);
  } else {
    await client.query(`CREATE DATABASE "${env.db.name}"`);
    console.log(`Base de datos "${env.db.name}" creada.`);
  }

  await client.end();
}

void main();
