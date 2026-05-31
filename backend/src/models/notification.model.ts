import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  actorId?: string;
  title?: string;
  message?: string;
  type: 'urgent' | 'info' | 'success' | 'soon' | 'follow';
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  actorId: { type: String },
  title: { type: String },
  message: { type: String },
  type: { type: String, enum: ['urgent', 'info', 'success', 'soon', 'follow'], default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '30d' }
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
