import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const cleanupOrphanedProjects = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // We need to look at both the 'projects' and 'users' collections.
    // Instead of importing the models which might have complex dependencies, we can just use raw collections
    const projectsCollection = mongoose.connection.collection('projects');
    const usersCollection = mongoose.connection.collection('users');

    // Get all user clerkUserIds
    const users = await usersCollection.find({}, { projection: { clerkUserId: 1 } }).toArray();
    const validUserIds = new Set(users.map(u => u.clerkUserId));

    console.log(`Found ${validUserIds.size} valid users in the database.`);

    // Find all projects
    const allProjects = await projectsCollection.find({}).toArray();
    console.log(`Found ${allProjects.length} total projects in the database.`);

    const orphanedProjectIds = [];
    for (const project of allProjects) {
      if (!validUserIds.has(project.userId)) {
        orphanedProjectIds.push(project._id);
      }
    }

    console.log(`Found ${orphanedProjectIds.length} orphaned projects.`);

    if (orphanedProjectIds.length > 0) {
      console.log('Deleting orphaned projects...');
      const result = await projectsCollection.deleteMany({ _id: { $in: orphanedProjectIds } });
      console.log(`Successfully deleted ${result.deletedCount} orphaned projects.`);
    } else {
      console.log('No orphaned projects found. Database is clean!');
    }

  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

cleanupOrphanedProjects();
