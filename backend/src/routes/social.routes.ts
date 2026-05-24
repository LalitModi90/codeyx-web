import { Router } from 'express';
import { followUser } from '../controllers/social.controller';

const router = Router();

router.post('/follow', followUser);

export default router;
