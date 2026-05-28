import mongoose, { Document, Schema } from 'mongoose';

export interface ISuggestion extends Document {
  category: 'degree' | 'branch' | 'job_role' | 'country' | 'skill';
  name: string;
  normalizedName: string;
  verified: boolean;
  createdBy: string;
}

const suggestionSchema = new Schema<ISuggestion>({
  category: { 
    type: String, 
    enum: ['degree', 'branch', 'job_role', 'country', 'skill'], 
    required: true 
  },
  name: { type: String, required: true },
  normalizedName: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdBy: { type: String }
}, { timestamps: true });

suggestionSchema.index({ category: 1, normalizedName: 1 }, { unique: true });

export const Suggestion = mongoose.models.Suggestion || mongoose.model<ISuggestion>('Suggestion', suggestionSchema);
