import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import { ApiResponse } from '../utils/ApiResponse';

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(new ApiResponse(200, notifications, 'Notifications fetched'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    return res.status(200).json(new ApiResponse(200, {}, 'Notifications marked as read'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const clearAll = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await Notification.deleteMany({ userId });
    return res.status(200).json(new ApiResponse(200, {}, 'Notifications cleared'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
