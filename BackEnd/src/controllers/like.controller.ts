import{ NextFunction, Request, RequestHandler, Response }from 'Express';
import{ZodError} from 'zod';
import{ likeService } from './like.service';
import{likeStatus, likeTarget}from './like.types';
import{ likeTargetParamsSchema } from './like.validation';

type LikeAction = (userId: string, target: likeTarget)=> promise<likeStatus>;


const createHandler = ( action:LikeAction):RequestHandler =>
  async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
      if(!req.user){
        res.status(401).json({message:'not authenticated'});
        return;
      }
      
      const target = likeTargetParamsSchema.parse(req.params);
      const status = await actions(req.user.id, target);
      
      res.status(200).json({data: status});
    }catch(error){
      if (error instanceof ZodError){
        res.status(400).json({
          message: 'invalid parameters',
          errors: error.flactten().fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
  
  export const likeController = {
    like: createHandler((userId,target)=>likeService.like(userId, target)),
    unlike: createHandler((userId,target)=>likeService.unlike(userId, target)),
    getStatus: createHandler((userId, target)=> alikeService.getStatus(userId, target)),
  };
  
  