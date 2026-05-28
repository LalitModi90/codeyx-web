import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserProgress extends Document {
  userId: string;
  sheetId?: Types.ObjectId;
  stepId?: Types.ObjectId;
  problemId: number;
  solved: boolean;
  revisionPending: boolean;
  solvedAt: Date | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: String, required: true },
    sheetId: { type: Schema.Types.ObjectId, ref: 'DsaSheet' },
    stepId: { type: Schema.Types.ObjectId, ref: 'DsaStep' },
    problemId: { type: Number, required: true },
    solved: { type: Boolean, default: false },
    revisionPending: { type: Boolean, default: false },
    solvedAt: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// 1. Unique compound key: prevents duplicate rows, speeds up single-problem lookups
UserProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

// 2. Covered query index for sheet-level aggregations (avoids full doc loads when counting)
UserProgressSchema.index({ userId: 1, sheetId: 1, solved: 1 });

// 3. Covered query index for step-level aggregations
UserProgressSchema.index({ userId: 1, stepId: 1, solved: 1 });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
