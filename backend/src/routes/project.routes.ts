import { Router } from 'express';
import { createProject, getProjects, getAllProjects } from '../controllers/project.controller';

const router = Router();

router.get('/explore/all', getAllProjects);
router.get('/:userId', getProjects);
router.post('/create', createProject); 

export default router;
