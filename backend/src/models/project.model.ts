import mongoose, { Schema, Document } from 'mongoose';

export interface IRating {
  userId: string;
  username: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IProject extends Document {
  userId: string;
  title: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  techStack: string[];
  screenshotUrl: string;
  featured: boolean;
  visibility: 'public' | 'private';
  deploymentStatus: string;
  deploymentProvider: string;
  stars: number;
  forks: number;
  readme: string;
  contributors: string[];
  languages: string[];
  isRepo: boolean;
  repoName: string;
  ratings: IRating[];
  updatedAt: Date;
  createdAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    techStack: [{ type: String }],
    screenshotUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    visibility: { type: String, enum: ['public', 'private'], default: 'private', index: true },
    deploymentStatus: { type: String, default: '' },
    deploymentProvider: { type: String, default: 'Source Only' },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    readme: { type: String, default: '' },
    contributors: [{ type: String }],
    languages: [{ type: String }],
    isRepo: { type: Boolean, default: false },
    repoName: { type: String, default: '' },
    ratings: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        userAvatar: { type: String, default: '' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
