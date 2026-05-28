import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PlatformStats } from './src/models/platformStats.model';

dotenv.config();

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    // Delete Codeforces connection with handle 'tourist'
    const result = await PlatformStats.deleteMany({ platform: 'codeforces', username: 'tourist' });
    console.log(`Successfully deleted ${result.deletedCount} Codeforces connections for handle 'tourist'.`);

    process.exit(0);
  } catch (err) {
    console.error('Failed to run cleanup:', err);
    process.exit(1);
  }
};

run();
