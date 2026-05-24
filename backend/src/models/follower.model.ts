import mongoose, { Schema, Document } from 'mongoose';

export interface IFollower extends Document {
  followerId: string;
  followingId: string;
}

const followerSchema = new Schema<IFollower>(
  {
    followerId: { type: String, required: true, index: true },
    followingId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

followerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const Follower = mongoose.model<IFollower>('Follower', followerSchema);
