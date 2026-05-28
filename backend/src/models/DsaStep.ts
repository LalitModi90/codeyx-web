import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDsaStep extends Document {
  sheetId: Types.ObjectId;
  stepNumber: number;
  title: string;
  totalProblems: number;
  createdAt: Date;
  updatedAt: Date;
}

const DsaStepSchema = new Schema<IDsaStep>(
  {
    sheetId: { type: Schema.Types.ObjectId, ref: 'DsaSheet', required: true, index: true },
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    totalProblems: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DsaStepSchema.index({ sheetId: 1, stepNumber: 1 }, { unique: true });

export const DsaStep = mongoose.model<IDsaStep>('DsaStep', DsaStepSchema);
