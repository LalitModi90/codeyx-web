import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserProgress } from './src/models/UserProgress';
import { PlatformStats } from './src/models/platformStats.model';

dotenv.config();

const resetProgress = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    console.log('Resetting UserProgress...');
    const progressResult = await UserProgress.deleteMany({});
    console.log(`Deleted ${progressResult.deletedCount} UserProgress documents.`);

    console.log('Resetting Codeyx PlatformStats...');
    const statsResult = await PlatformStats.deleteMany({ platform: 'codeyx' });
    console.log(`Deleted ${statsResult.deletedCount} Codeyx PlatformStats documents.`);

    console.log('Progress reset successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting progress:', error);
    process.exit(1);
  }
};

resetProgress();
