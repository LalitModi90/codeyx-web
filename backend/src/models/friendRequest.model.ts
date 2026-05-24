import mongoose, { Schema, Document } from 'mongoose';

export interface IFriendRequest extends Document {
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    senderId: { type: String, required: true, index: true },
    receiverId: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

friendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export const FriendRequest = mongoose.model<IFriendRequest>('FriendRequest', friendRequestSchema);
