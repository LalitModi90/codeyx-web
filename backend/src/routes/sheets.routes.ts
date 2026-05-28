import { Router } from 'express';
import { getAllSheets, getSheetBySlug } from '../controllers/sheets.controller';

const router = Router();

router.get('/', getAllSheets);
router.get('/:slug', getSheetBySlug);

export default router;
