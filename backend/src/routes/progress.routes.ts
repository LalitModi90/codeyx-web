import { Router } from 'express';
import { protectRoute } from '../middlewares/clerk.middleware';
import {
  toggleProgress,
  updateProgress,
  updateRevision,
  updateNote,
  getSheetProgress,
  getAllProgress,
  getStepProgress,
  getSheetBySlug,
  getProgressStats,
  deleteSheetProgress,
  extensionSync
} from '../controllers/progress.controller';

const router = Router();

// Extension Webhook (unprotected, validates userId internally)
router.post('/extension-sync', extensionSync);

router.use(protectRoute);

// Write operations
router.post('/toggle', toggleProgress);
router.post('/update', updateProgress);
router.post('/revision', updateRevision);
router.post('/note', updateNote);

// Read operations
router.get('/stats', getProgressStats);
router.get('/all', getAllProgress);
router.get('/slug/:slug', getSheetBySlug);
router.get('/step/:stepId', getStepProgress);
router.get('/:sheetId', getSheetProgress);

// Delete
router.delete('/sheet/:slug', deleteSheetProgress);

export default router;
