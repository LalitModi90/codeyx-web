import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: string;
  title: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  techStack: string[];
  screenshotUrl: string;
  featured: boolean;
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    techStack: [{ type: String }],
    screenshotUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
