import { Router } from 'express';
import { protectRoute } from '../middlewares/clerk.middleware';
import {
  createSheet,
  getSheets,
  deleteSheet,
  addProblem,
  removeProblem,
  getSheetProgress,
} from '../controllers/customSheets.controller';

const router = Router();

router.use(protectRoute);

router.post('/create', createSheet);
router.get('/', getSheets);
router.delete('/:id', deleteSheet);
router.post('/add-problem', addProblem);
router.post('/remove-problem', removeProblem);
router.get('/:id/progress', getSheetProgress);

export default router;
