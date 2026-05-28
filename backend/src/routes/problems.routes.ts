import { Router } from 'express';
import { getProblemById } from '../controllers/problems.controller';

const router = Router();

router.get('/:id', getProblemById);

export default router;
