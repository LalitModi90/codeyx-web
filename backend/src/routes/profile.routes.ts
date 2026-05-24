import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { withClerkAuth, protectRoute } from '../middlewares/clerk.middleware';

const router = Router();

// Profile GET supports optional auth so follow state can be resolved for logged-in viewers.
router.get('/:userId', withClerkAuth, getProfile);
router.post('/update', withClerkAuth, protectRoute, updateProfile); 

export default router;
