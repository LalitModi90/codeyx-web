import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  actorId: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'view';
  entityId?: string;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    actorId: { type: String, required: true },
    type: { type: String, required: true, enum: ['follow', 'like', 'comment', 'mention', 'view'] },
    entityId: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
