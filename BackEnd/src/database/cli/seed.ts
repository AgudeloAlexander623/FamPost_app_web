// src/database/cli/seed.ts -> inserta datos de ejemplo
import { AppDataSource } from '../../config/database';
import { runSeed } from '../seed';

async function main(): Promise<void> {
  await runSeed();
  await AppDataSource.destroy();
}

void main().catch((error) => {
  console.error('Fallo al insertar datos de ejemplo:', error.message);
  process.exit(1);
});
