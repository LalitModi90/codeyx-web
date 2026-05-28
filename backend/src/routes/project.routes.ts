import { Router } from 'express';
import { 
  createProject, 
  getProjects, 
  updateProject, 
  deleteProject, 
  toggleVisibility, 
  toggleFeatured,
  getPublicPortfolio,
  syncGithubProjectsExplicit,
  getAllPublicProjects,
  addProjectRating
} from '../controllers/project.controller';
import { protectRoute } from '../middlewares/clerk.middleware';

const router = Router();

// Public routes
router.get('/public/all/explore', getAllPublicProjects);
router.get('/public/:username', getPublicPortfolio);

// Protected routes
router.get('/:userId', getProjects);
router.post('/create', protectRoute, createProject); 
router.put('/update/:projectId', protectRoute, updateProject);
router.delete('/delete/:projectId', protectRoute, deleteProject);
router.put('/toggle-visibility/:projectId', protectRoute, toggleVisibility);
router.put('/toggle-featured/:projectId', protectRoute, toggleFeatured);
router.post('/sync-github', protectRoute, syncGithubProjectsExplicit);
router.post('/rate/:projectId', protectRoute, addProjectRating);

export default router;
