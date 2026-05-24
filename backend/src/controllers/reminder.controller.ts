import { Request, Response } from 'express';
import { Reminder } from '../models/Reminder';
import { Contest } from '../models/Contest';
import { generateICSFileContent } from '../utils/calendar';
import mongoose from 'mongoose';

// 1. Create a reminder
export const createReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || req.body.userId;
    const { contestId, reminderBefore } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    if (!contestId || !reminderBefore) {
      return res.status(400).json({ success: false, message: 'Missing contestId or reminderBefore.' });
    }

    // Verify contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found.' });
    }

    // Check if reminder is in the past
    const triggerTime = new Date(contest.startTime.getTime() - reminderBefore * 60 * 1000);
    if (triggerTime <= new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot set a reminder that triggers in the past.' });
    }

    // Create the reminder
    const reminder = await Reminder.create({
      userId,
      contestId,
      reminderBefore,
      notified: false
    });

    // Populate contest info
    const populated = await reminder.populate('contestId');

    return res.status(201).json({
      success: true,
      message: 'Reminder scheduled successfully.',
      data: populated
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already set a reminder for this contest and interval.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get all reminders for a user
export const getReminders = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User ID required.' });
    }

    // Fetch and populate contests
    const reminders = await Reminder.find({ userId })
      .populate('contestId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reminders
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Delete a reminder
export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId || req.body.userId || req.query.userId;

    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    // Enforce authorization if userId is available
    if (userId && reminder.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this reminder.' });
    }

    await Reminder.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Export contest to .ics file dynamically
export const exportContestICS = async (req: Request, res: Response) => {
  try {
    const { contestId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(contestId as string)) {
      return res.status(400).json({ success: false, message: 'Invalid contest ID.' });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found.' });
    }

    const icsContent = generateICSFileContent({
      name: contest.name,
      startTime: contest.startTime,
      endTime: contest.endTime,
      url: contest.url,
      platform: contest.site,
      description: `Add this coding contest to your calendar! URL: ${contest.url}`
    });

    const filename = `${contest.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(icsContent);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
