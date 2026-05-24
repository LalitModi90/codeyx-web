import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller';

const router = Router();

// GET /api/search?query=hello&type=all&limit=5
router.get('/', globalSearch);

export default router;
