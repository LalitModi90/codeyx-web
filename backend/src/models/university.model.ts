import mongoose, { Document, Schema } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  normalizedName: string;
  shortName?: string;
  city?: string;
  state?: string;
  country: string;
  verified: boolean;
  createdBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const universitySchema = new Schema<IUniversity>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  normalizedName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  shortName: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'India',
  },
  verified: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdBy: {
    type: String, // Clerk User ID
    index: true,
  },
}, { timestamps: true });

// Create a compound index for fast searching
universitySchema.index({ name: 'text', shortName: 'text' });

export const University = mongoose.models.University || mongoose.model<IUniversity>('University', universitySchema);
