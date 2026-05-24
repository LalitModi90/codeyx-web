import { Router } from 'express';
import { createProject, getProjects } from '../controllers/project.controller';

const router = Router();

router.get('/:userId', getProjects);
router.post('/create', createProject); 

export default router;
