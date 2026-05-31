import { Router } from 'express';
import { getUserNotifications, markAsRead, clearAll } from '../controllers/notification.controller';
import { protectRoute } from '../middlewares/clerk.middleware';

const router = Router();

router.get('/', protectRoute, getUserNotifications);
router.put('/read', protectRoute, markAsRead);
router.delete('/', protectRoute, clearAll);

export default router;
