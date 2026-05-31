import { Request, Response } from 'express';
import { Feedback } from '../models/Feedback';
import nodemailer from 'nodemailer';

export const submitFeedback = async (req: Request, res: Response) => {
  console.log('[Feedback] Incoming submission:', req.body);
  try {
    const { message, email } = req.body;
    const userId = (req as any).auth?.userId || 'Anonymous';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const title = message.split(' ').slice(0, 5).join(' ') + (message.length > 30 ? '...' : '');

    const feedback = await Feedback.create({
      userId,
      email,
      suggestion: message,
      title
    });

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // sending to admin
        subject: `New Feedback from Codeyx: ${title}`,
        text: `New Feedback Received!\n\nUser/Email: ${email || userId}\n\nMessage:\n${message}\n\nReview this in your Admin Portal.`,
      };

      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Failed to send feedback email:', mailError);
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error: any) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in-progress', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (error: any) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
