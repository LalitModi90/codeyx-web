import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomSheet extends Document {
  userId: string;
  title: string;
  description: string;
  visibility: 'private' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

const CustomSheetSchema = new Schema<ICustomSheet>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  },
  { timestamps: true }
);

export const CustomSheet = mongoose.model<ICustomSheet>('CustomSheet', CustomSheetSchema);
