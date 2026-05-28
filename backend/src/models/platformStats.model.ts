import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformStats extends Document {
  userId: string;
  platform: 'leetcode' | 'codeforces' | 'github' | 'codechef' | 'codeyx' | 'atcoder' | 'hackerrank';
  username: string;
  stats: any; // Dynamic JSON to hold the raw data
  totalSolved: number;
  rating: number;
  lastSyncedAt: Date;
}

const PlatformStatsSchema = new Schema<IPlatformStats>(
  {
    userId: { type: String, required: true, index: true },
    platform: { 
      type: String, 
      enum: ['leetcode', 'codeforces', 'github', 'codechef', 'codeyx', 'atcoder', 'hackerrank'], 
      required: true 
    },
    username: { type: String, required: true },
    stats: { type: Schema.Types.Mixed, default: {} },
    totalSolved: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index to quickly fetch a user's specific platform
PlatformStatsSchema.index({ userId: 1, platform: 1 }, { unique: true });

export const PlatformStats = mongoose.model<IPlatformStats>('PlatformStats', PlatformStatsSchema);
