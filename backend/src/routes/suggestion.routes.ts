import express from 'express';
import { addCustomSuggestion, getSuggestions } from '../controllers/suggestion.controller';

const router = express.Router();

router.post('/', addCustomSuggestion);
router.get('/', getSuggestions);

export default router;
