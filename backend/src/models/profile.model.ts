import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: string;
  username?: string;
  name?: string;
  bio: string;
  about: string;
  location: string;
  college: string;
  branch: string;
  year: string;
  degree: string;
  jobRole: string;
  portfolio: string;
  email: string;
  bannerUrl: string;
  skills: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
    website?: string;
  };
  publicSettings: {
    isPublic: boolean;
    showProjects: boolean;
    showSkills: boolean;
  };
}

const profileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    name: { type: String, default: '' },
    bio: { type: String, default: '' },
    about: { type: String, default: '' },
    location: { type: String, default: '' },
    college: { type: String, default: '' },
    branch: { type: String, default: '' },
    year: { type: String, default: '' },
    degree: { type: String, default: '' },
    jobRole: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    email: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    skills: { type: [String], default: [] },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    publicSettings: {
      isPublic: { type: Boolean, default: true },
      showProjects: { type: Boolean, default: true },
      showSkills: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);

