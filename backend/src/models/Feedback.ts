import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  userId: string;
  email?: string;
  suggestion: string;
  title?: string;
  upvotes: number;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  userId: { type: String, default: 'Anonymous' },
  email: { type: String },
  suggestion: { type: String, required: true },
  title: { type: String },
  upvotes: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
