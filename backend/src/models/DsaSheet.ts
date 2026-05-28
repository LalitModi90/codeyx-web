import mongoose, { Schema, Document } from 'mongoose';

export interface IDsaSheet extends Document {
  slug: string;
  title: string;
  description: string;
  source: string;
  totalProblems: number;
  icon: string;
  color: string;
  tags: string[];
  followers?: number;
  rating?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DsaSheetSchema = new Schema<IDsaSheet>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: String, default: '' },
    totalProblems: { type: Number, default: 0 },
    icon: { type: String, default: 'Code2' },
    color: { type: String, default: 'from-purple-600 to-indigo-600' },
    tags: [{ type: String }],
    followers: { type: Number, default: 0 },
    rating: { type: Number, default: 0.0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DsaSheet = mongoose.model<IDsaSheet>('DsaSheet', DsaSheetSchema);
