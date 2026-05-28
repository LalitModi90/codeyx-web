import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPatternProblem extends Document {
  patternId: Types.ObjectId;
  masterProblemId: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PatternProblemSchema = new Schema<IPatternProblem>(
  {
    patternId: { type: Schema.Types.ObjectId, ref: 'Pattern', required: true },
    masterProblemId: { type: Number, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PatternProblemSchema.index({ patternId: 1, masterProblemId: 1 }, { unique: true });
PatternProblemSchema.index({ masterProblemId: 1 });

export const PatternProblem = mongoose.model<IPatternProblem>('PatternProblem', PatternProblemSchema);
