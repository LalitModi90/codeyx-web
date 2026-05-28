import { Router } from 'express';
import { getUniversities, addUniversity, verifyUniversity } from '../controllers/university.controller';

const router = Router();

// Publicly accessible to search for universities
router.get('/', getUniversities);

// Add a new university (could be protected by clerk auth middleware if you wish)
router.post('/', addUniversity);

// Admin route to verify university
router.patch('/:id/verify', verifyUniversity);

export default router;
