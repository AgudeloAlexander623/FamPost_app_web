// src/controllers/photo.controller.ts
import { type Request, type Response } from 'express';

import { photoService, type PhotoInput } from '../services/photo.service';
import { AppError } from '../utils/AppError';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseInput(body: Request['body']): PhotoInput {
  const { title, description, url, userId } = body as Partial<PhotoInput>;

  if (!title || typeof title !== 'string') {
    throw new AppError(400, 'El campo title es obligatorio');
  }
  if (!url || typeof url !== 'string') {
    throw new AppError(400, 'El campo url es obligatorio');
  }

  return { title, url, description: description ?? null, userId: userId ?? null };
}

export const photoController = {
  async list(_req: Request, res: Response): Promise<void> {
    res.json(await photoService.list());
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id || !UUID_PATTERN.test(id)) {
      throw new AppError(400, `El id "${id ?? ''}" no tiene el formato de un UUID`);
    }
    res.json(await photoService.findById(id));
  },

  async create(req: Request, res: Response): Promise<void> {
    const photo = await photoService.create(parseInput(req.body));
    res.status(201).json(photo);
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id || !UUID_PATTERN.test(id)) {
      throw new AppError(400, `El id "${id ?? ''}" no tiene el formato de un UUID`);
    }
    await photoService.remove(id);
    res.status(204).send();
  },
};
