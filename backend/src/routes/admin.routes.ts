import { Router } from 'express';
import { deleteUserFromClerk, banUser, sendNotification, getSettings, updateSettings, forceSyncAll, getSyncList, syncOne } from '../controllers/admin.controller';
import { protectRoute } from '../middlewares/clerk.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Double security: protectRoute (Clerk token check) + requireAdmin (whitelist + role check)
router.post('/delete-user',  protectRoute, requireAdmin, deleteUserFromClerk);
router.post('/ban-user',     protectRoute, requireAdmin, banUser);
router.post('/notify',       protectRoute, requireAdmin, sendNotification);
router.get('/settings',      protectRoute, requireAdmin, getSettings);
router.put('/settings',      protectRoute, requireAdmin, updateSettings);
router.post('/force-sync',   protectRoute, requireAdmin, forceSyncAll);
router.get('/sync-list',     protectRoute, requireAdmin, getSyncList);
router.post('/sync-one',     protectRoute, requireAdmin, syncOne);

export default router;

