import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICustomSheetProblem extends Document {
  customSheetId: Types.ObjectId;
  problemId: number;
  sourceSlug: string;
  addedAt: Date;
}

const CustomSheetProblemSchema = new Schema<ICustomSheetProblem>(
  {
    customSheetId: { type: Schema.Types.ObjectId, ref: 'CustomSheet', required: true },
    problemId: { type: Number, required: true },
    sourceSlug: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CustomSheetProblemSchema.index({ customSheetId: 1, problemId: 1, sourceSlug: 1 }, { unique: true });
CustomSheetProblemSchema.index({ customSheetId: 1 });

export const CustomSheetProblem = mongoose.model<ICustomSheetProblem>('CustomSheetProblem', CustomSheetProblemSchema);
