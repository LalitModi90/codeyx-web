import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const wipeUserData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in .env");
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    const collectionsToClear = [
      'users',
      'profiles',
      'platformstats',
      'useractivities',
      'userfavorites',
      'userprogresses',
      'projects',
      'reminders',
      'followers',
      'notifications',
      'customsheets',
      'customsheetproblems'
    ];

    console.log('🧹 Clearing user data...');
    
    for (const collectionName of collectionsToClear) {
      try {
        await mongoose.connection.collection(collectionName).deleteMany({});
        console.log(`- Cleared ${collectionName}`);
      } catch (err: any) {
        // Collection might not exist yet, which is fine
        if (err.code !== 26) {
           console.log(`- Skipped ${collectionName} (Not found or empty)`);
        }
      }
    }

    console.log('✅ All user data has been successfully removed from the database!');
    console.log('⚠️ Note: Contests and Universities data were kept safe.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error wiping data:', error);
    process.exit(1);
  }
};

wipeUserData();
