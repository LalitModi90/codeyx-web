import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Project } from './src/models/project.model';
import { redisClient } from './src/config/redis.config';

dotenv.config();

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    // Clear all ratings from all projects
    const result = await Project.updateMany({}, { $set: { ratings: [] } });
    console.log(`Successfully cleared ratings/reviews for ${result.modifiedCount} project(s).`);

    // Invalidate caches by fetching all project userIds
    const userIds = await Project.distinct('userId');
    for (const uid of userIds) {
      await redisClient.del(`projects:${uid}`);
    }
    console.log(`Successfully invalidated Redis project cache for all users.`);

    process.exit(0);
  } catch (err) {
    console.error('Failed to clear ratings:', err);
    process.exit(1);
  }
};

run();
