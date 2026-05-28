import mongoose, { Schema, Document } from 'mongoose';

export interface IPatternCategory extends Document {
  title: string;
  description: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatternCategorySchema = new Schema<IPatternCategory>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Folder' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PatternCategorySchema.index({ order: 1 });

export const PatternCategory = mongoose.model<IPatternCategory>('PatternCategory', PatternCategorySchema);
