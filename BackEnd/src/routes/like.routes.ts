import {Router} from "express";
import {likeController} from " ./like.controller.ts"; 

const router = Router();

router.post('/:targetId/like', likeController.like);
router.post('/:targetId/unlike', likeController.unlike);
router.get('/:targetId/status', likeController.getStatus);

export default router;