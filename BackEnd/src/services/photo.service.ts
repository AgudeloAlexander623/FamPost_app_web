// src/services/photo.service.ts -> acceso a la tabla photos con TypeORM
import { AppDataSource } from '../config/database';
import { Photo } from '../entities/Photo';
import { AppError } from '../utils/AppError';

export interface PhotoInput {
  title: string;
  description?: string | null;
  url: string;
  userId?: string | null;
}

function getRepository() {
  return AppDataSource.getRepository(Photo);
}

export const photoService = {
  async list(): Promise<Photo[]> {
    return getRepository().find({ order: { createdAt: 'DESC' } });
  },

  async findById(id: string): Promise<Photo> {
    const photo = await getRepository().findOneBy({ id });
    if (!photo) {
      throw new AppError(404, `Foto no encontrada: ${id}`);
    }
    return photo;
  },

  async create(input: PhotoInput): Promise<Photo> {
    const repository = getRepository();
    const photo = repository.create({
      title: input.title,
      description: input.description ?? null,
      url: input.url,
      userId: input.userId ?? null,
    });
    return repository.save(photo);
  },

  async remove(id: string): Promise<void> {
    const result = await getRepository().delete(id);
    if (!result.affected) {
      throw new AppError(404, `Foto no encontrada: ${id}`);
    }
  },
};
