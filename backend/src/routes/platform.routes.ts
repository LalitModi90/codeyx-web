import { Router } from 'express';
import { triggerPlatformSync, getPlatformStats, getAllPlatformStats } from '../controllers/platform.controller';
import { protectRoute } from '../middlewares/clerk.middleware';

const router = Router();

// Test Route (Public)
router.get('/health', (req, res) => res.json({ status: 'Platform Service Active' }));

// Fetch Stats Route (GET)
router.get('/stats', getPlatformStats);

// Fetch All Platforms for a user (GET)
router.get('/all', getAllPlatformStats);

// Sync Route (POST)
router.post('/sync', triggerPlatformSync); 

export default router;
