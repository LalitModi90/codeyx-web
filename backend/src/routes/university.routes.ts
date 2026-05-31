import { Router } from 'express';
import { getUniversities, addUniversity, verifyUniversity, updateUniversity, deleteUniversity } from '../controllers/university.controller';

const router = Router();

// Publicly accessible to search for universities
router.get('/', getUniversities);

// Add a new university (could be protected by clerk auth middleware if you wish)
router.post('/', addUniversity);

// Admin route to verify university
router.patch('/:id/verify', verifyUniversity);

// Admin route to update university
router.put('/:id', updateUniversity);

// Admin route to delete university
router.delete('/:id', deleteUniversity);

export default router;
