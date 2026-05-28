import { Router } from 'express';
import { protectRoute } from '../middlewares/clerk.middleware';
import { toggleFavorite, getFavorites } from '../controllers/favorites.controller';

const router = Router();

router.use(protectRoute);

router.post('/toggle', toggleFavorite);
router.get('/', getFavorites);

export default router;
