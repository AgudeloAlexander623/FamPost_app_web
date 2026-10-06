import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { likeService } from './like.service';
import { LikeStatus, LikeTarget } from './like.types';
import { likeTargetParamsSchema } from './like.validation';

type LikeAction = (userId: string, targetId: string) => Promise<LikeStatus>;

const createHandler = (action: LikeAction): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user){
            res.status(401).json({message: 'Unauthorized'});
            return; 
        }
        const target = likeTargetParamsSchema.parse(req.params);
        const status = await action(req.user.id, target.targetId);
        res.status(200).json({ status });
    }catch(error){
        if (error instanceof ZodError) {
            res.status(400).json({ message: 'Invalid request data', errors: error.errors });
        } else {
            next(error);
        }
    }
  };
  export const likeController = {
    like: createHandler((userId, target) => likeService.like(userId, target)),
    unlike: createHandler((userId, target) => likeService.unlike(userId, target)),
    getStatus: createHandler((userId, target) => likeService.getStatus(userId,target)),
  }
}