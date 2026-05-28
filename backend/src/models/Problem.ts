import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProblem extends Document {
  sheetId: Types.ObjectId;
  stepId: Types.ObjectId;
  problemId: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  link: string;
  youtubeUrl: string;
  articleUrl: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    sheetId: { type: Schema.Types.ObjectId, ref: 'DsaSheet', required: true, index: true },
    stepId: { type: Schema.Types.ObjectId, ref: 'DsaStep', required: true, index: true },
    problemId: { type: Number, required: true },
    name: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    platform: { type: String, default: '' },
    link: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    articleUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProblemSchema.index({ sheetId: 1, problemId: 1 }, { unique: true });
ProblemSchema.index({ stepId: 1, problemId: 1 });

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
