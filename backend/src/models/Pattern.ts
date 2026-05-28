import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPattern extends Document {
  categoryId: Types.ObjectId;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatternSchema = new Schema<IPattern>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'PatternCategory', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PatternSchema.index({ categoryId: 1, order: 1 });

export const Pattern = mongoose.model<IPattern>('Pattern', PatternSchema);
