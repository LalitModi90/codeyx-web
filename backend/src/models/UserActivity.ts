import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserActivity extends Document {
  userId: string;
  type: 'solved_problem' | 'started_sheet' | 'completed_pattern' | 'revision_marked' | 'bookmarked_problem' | 'completed_sheet';
  title: string;
  problemId?: number;
  sheetId?: Types.ObjectId;
  patternId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserActivitySchema = new Schema<IUserActivity>(
  {
    userId: { type: String, required: true, index: true },
    type: { 
      type: String, 
      enum: ['solved_problem', 'started_sheet', 'completed_pattern', 'revision_marked', 'bookmarked_problem', 'completed_sheet'],
      required: true
    },
    title: { type: String, required: true },
    problemId: { type: Number },
    sheetId: { type: Schema.Types.ObjectId, ref: 'DsaSheet' },
    patternId: { type: String },
  },
  { timestamps: true }
);

// Index to quickly fetch a user's recent activity, sorted by newest first
UserActivitySchema.index({ userId: 1, createdAt: -1 });

export const UserActivity = mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);
