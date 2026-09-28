// src/database/seed.ts -> datos de ejemplo
import { AppDataSource } from '../config/database';
import { Photo } from '../entities/Photo';

const photos: Array<Partial<Photo>> = [
  {
    title: 'Atardecer en la playa',
    description: 'Ejemplo de seed',
    url: 'https://picsum.photos/id/1015/800/600',
    userId: 'admin',
  },
  {
    title: 'Montanas con nieve',
    description: 'Ejemplo de seed',
    url: 'https://picsum.photos/id/1018/800/600',
    userId: 'usuario',
  },
];

export async function runSeed(): Promise<void> {
  await AppDataSource.initialize();
  const repository = AppDataSource.getRepository(Photo);

  const existing = await repository.count();
  if (existing > 0) {
    console.log(`La tabla photos ya tiene ${existing} filas: no se inserta nada.`);
    return;
  }

  await repository.save(repository.create(photos));
  console.log(`Insertadas ${photos.length} fotos de ejemplo.`);
}
