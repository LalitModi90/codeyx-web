import { Router } from 'express';
import express from 'express';
import { clerkWebhookHandler } from '../controllers/webhook.controller';

const router = Router();

// Webhook endpoint must parse raw body for Svix signature verification!
router.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhookHandler);

export default router;
