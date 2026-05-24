import { Webhook } from 'svix';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Profile } from '../models/profile.model';
import { addCleanupJob } from '../queues/cleanup.queue';
import { emitToUser } from '../socket';
import { redisClient } from '../config/redis.config';

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occured -- no svix headers' });
  }

  // Get the body
  const payload = req.body;
  const body = payload.toString('utf8'); // Assuming we use express.raw()

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ Error: err });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`[Webhook] Received event ${eventType} for Clerk ID ${id}`);

  try {
    if (eventType === 'user.created') {
      const email = evt.data.email_addresses[0]?.email_address;
      
      // Auto Create User
      const user = await User.create({
        clerkUserId: id,
        email: email,
        firstName: evt.data.first_name || '',
        lastName: evt.data.last_name || '',
        avatarUrl: evt.data.image_url || '',
      });

      // Auto Create Profile
      await Profile.create({
        userId: id,
      });

      console.log(`[Webhook] System setup complete for new user: ${id}`);
      emitToUser(id, 'SYSTEM_SETUP_COMPLETE', { userId: id });
    }

    if (eventType === 'user.updated') {
      await User.findOneAndUpdate(
        { clerkUserId: id },
        {
          firstName: evt.data.first_name || '',
          lastName: evt.data.last_name || '',
          avatarUrl: evt.data.image_url || '',
        }
      );
      // Let active socket connections know profile updated
      emitToUser(id, 'PROFILE_UPDATED', { clerkUserId: id });
    }

    if (eventType === 'user.deleted') {
      // Massive Cascade Delete Required
      // We push this to BullMQ so we don't block the webhook response
      await addCleanupJob(id);
      
      // Tell frontend to disconnect/clean UI
      emitToUser(id, 'USER_DELETED', { clerkUserId: id });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err.message);
    // Still return 200 to Clerk if it's our DB issue, or 500 to retry? 
    // Usually best to return 500 so Clerk retries the event.
    return res.status(500).json({ error: 'Internal server error processing webhook' });
  }
};
