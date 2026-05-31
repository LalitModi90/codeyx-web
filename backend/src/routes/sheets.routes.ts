import { Router } from 'express';
import { getAllSheets, getSheetBySlug, createSheet, updateSheet, deleteSheet } from '../controllers/sheets.controller';

const router = Router();

router.get('/', getAllSheets);
router.get('/:slug', getSheetBySlug);

router.post('/', createSheet);
router.put('/:id', updateSheet);
router.delete('/:id', deleteSheet);

export default router;
