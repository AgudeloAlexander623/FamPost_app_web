// src/database/cli/revert.ts -> deshace la ultima migracion
import { AppDataSource } from '../../config/database';

async function main(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.undoLastMigration();
  console.log('Ultima migracion deshecha.');
  await AppDataSource.destroy();
}

void main().catch((error) => {
  console.error('Fallo al revertir la migracion:', error.message);
  process.exit(1);
});
