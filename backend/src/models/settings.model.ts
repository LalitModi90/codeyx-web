import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  platformName: string;
  supportEmail: string;
  siteDescription: string;
  maintenanceMode: boolean;
  alfaLeetcodeUrl: string;
  githubToken: string;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    platformName: { type: String, default: 'Codeyx' },
    supportEmail: { type: String, default: 'support@codeyx.com' },
    siteDescription: { 
      type: String, 
      default: 'Codeyx is a modern coding platform that provides coding sheets, programming contests, developer projects, and DSA practice.' 
    },
    maintenanceMode: { type: Boolean, default: false },
    alfaLeetcodeUrl: { type: String, default: 'https://alfa-leetcode-api.onrender.com' },
    githubToken: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
