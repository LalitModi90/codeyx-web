import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

// In a real app with Clerk, use `requireAuth` middleware for the POST/PUT routes
router.get('/:userId', getProfile);
router.post('/update', updateProfile); 

export default router;
