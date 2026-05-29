import { Webhook } from 'svix';
import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Profile } from '../models/profile.model';
import { Project } from '../models/project.model';
import { PlatformStats } from '../models/platformStats.model';
import { UserActivity } from '../models/UserActivity';
import { UserFavorite } from '../models/UserFavorite';
import { UserProgress } from '../models/UserProgress';
import { Reminder } from '../models/Reminder';
import { CustomSheet } from '../models/CustomSheet';
import { CustomSheetProblem } from '../models/CustomSheetProblem';
import { Follower } from '../models/follower.model';
import { Notification } from '../models/notification.model';
import { addCleanupJob } from '../queues/cleanup.queue';
import { emitToUser } from '../socket';
import { redisClient } from '../config/redis.config';
import { executeCascadeCleanup } from '../services/cleanup.service';
import { sendAdminAlertEmail, sendWelcomeEmail } from '../services/mail.service';

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

      const firstName = evt.data.first_name || '';
      const lastName = evt.data.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();

      // Generate base name for username
      let baseName = firstName ? firstName.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'user';
      if (!baseName && email) {
        baseName = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      }

      // Ensure uniqueness
      let isUnique = false;
      let newUsername = '';
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const randomDigits = Math.floor(Math.random() * 900000) + 100000;
        newUsername = `${baseName}_${randomDigits}`;
        const existing = await Profile.findOne({ username: { $regex: new RegExp(`^${newUsername}$`, 'i') } });
        if (!existing) isUnique = true;
        attempts++;
      }

      // Auto Create Profile with initial name and username
      await Profile.create({
        userId: id,
        name: fullName,
        username: newUsername,
      });

      console.log(`[Webhook] System setup complete for new user: ${id}`);
      emitToUser(id, 'SYSTEM_SETUP_COMPLETE', { userId: id });

      // Send Welcome Email to User
      if (email) {
        sendWelcomeEmail(email, evt.data.first_name || '').catch(console.error);
      }

      // Notify Admin
      const htmlMsg = `
        <h3>New User Registered!</h3>
        <p><strong>Name:</strong> ${evt.data.first_name || ''} ${evt.data.last_name || ''}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Clerk ID:</strong> ${id}</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `;
      sendAdminAlertEmail('New User Registration', htmlMsg).catch(console.error);
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
      console.log(`[Webhook] Commencing immediate soft delete / profile deactivation for Clerk ID ${id}...`);

      // Notify Admin
      const htmlMsg = `
        <h3 style="color: red;">User Account Deleted</h3>
        <p><strong>Clerk ID:</strong> ${id}</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>The cleanup cascade has been triggered for this user.</p>
      `;
      sendAdminAlertEmail('User Deleted Account', htmlMsg).catch(console.error);

      // 1. Fetch follower/following connections to invalidate related user caches immediately
      let followers: string[] = [];
      let followings: string[] = [];
      try {
        const followerDocs = await Follower.find({ followingId: id }).lean();
        const followingDocs = await Follower.find({ followerId: id }).lean();
        followers = followerDocs.map(f => f.followerId);
        followings = followingDocs.map(f => f.followingId);
      } catch (err) {
        console.error('[Webhook] Error fetching follower lists:', err);
      }

      // 2. Hide profile instantly by deleting key identity tables (User, Profile, PlatformStats)
      await Promise.all([
        User.deleteOne({ clerkUserId: id }),
        Profile.deleteMany({ userId: id }),
        PlatformStats.deleteMany({ userId: id }),
      ]);

      // 3. Clear direct and associated Redis caches immediately
      try {
        const keysToDel = [
          `projects:${id}`,
          `profile:${id}`,
          `user:${id}`,
          `followers:${id}`,
          `following:${id}`,
          `leaderboard:${id}`,
          `portfolio:${id}`,
          `analytics:${id}`
        ];

        followers.forEach(fid => keysToDel.push(`following:${fid}`));
        followings.forEach(fid => keysToDel.push(`followers:${fid}`));

        if (redisClient && typeof redisClient.del === 'function') {
          await Promise.all(keysToDel.map(key => redisClient.del(key).catch(() => {})));
        }
      } catch (cacheErr) {
        console.error('[Webhook] Error clearing caches:', cacheErr);
      }

      console.log(`[Webhook] Account hidden. Portfolios/Leaderboard disabled. Queueing full background cleanup for Clerk ID ${id}...`);

      // 4. Try queueing background cleanup job (BullMQ Redis)
      let queued = false;
      try {
        await addCleanupJob(id);
        queued = true;
      } catch (err) {
        console.log('[Webhook] Cleanup queue skip (local dev Redis might be offline):', err);
      }

      // 5. If BullMQ queueing failed or bypassed (offline Redis), execute in-process non-blocking fallback cleanup
      if (!queued) {
        console.log('[Webhook] Executing fallback in-process background cleanup...');
        Promise.resolve().then(async () => {
          try {
            await executeCascadeCleanup(id);
          } catch (fallbackErr) {
            console.error('[Webhook Fallback Background Cleanup Error]', fallbackErr);
          }
        });
      }
      
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
