import express from 'express';
import { submitFeedback, getFeedbacks, updateFeedbackStatus } from '../controllers/feedback.controller';

const router = express.Router();

router.post('/', submitFeedback);
router.get('/', getFeedbacks);
router.patch('/:id/status', updateFeedbackStatus);

export default router;
