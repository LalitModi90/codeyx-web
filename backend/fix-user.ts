import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const fixMissingUser = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error('MONGODB_URI is not defined in .env');

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    const db = mongoose.connection;
    const users = db.collection('users');
    const profiles = db.collection('profiles');
    const platformStats = db.collection('platformstats');
    const projects = db.collection('projects');

    // Find any project to get the userId
    const anyProject = await projects.findOne({});
    if (!anyProject) {
        console.log('No projects found to extract userId from.');
        process.exit(0);
    }
    
    const userId = anyProject.userId;
    console.log(`Found active userId: ${userId}`);

    // Check if user exists
    const existingUser = await users.findOne({ clerkUserId: userId });
    if (!existingUser) {
        console.log('User document is missing! Creating it now...');
        await users.insertOne({
            clerkUserId: userId,
            email: 'admin@local.dev',
            firstName: 'Lalit',
            lastName: 'Modi',
            avatarUrl: 'https://github.com/LalitModi90.png',
            isPremium: false,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('User document created successfully.');
    } else {
        console.log('User document already exists.');
    }

    // Check if profile exists
    const existingProfile = await profiles.findOne({ userId: userId });
    if (!existingProfile) {
        console.log('Profile document is missing! Creating it now...');
        await profiles.insertOne({
            userId: userId,
            username: 'LalitModi90',
            name: 'Lalit Modi',
            bio: 'Open Source Contributor',
            createdAt: new Date(),
            updatedAt: new Date(),
            publicSettings: { isPublic: true, showProjects: true, showSkills: true }
        });
        console.log('Profile document created successfully.');
    } else {
        console.log('Profile document already exists.');
    }

    console.log('All missing records fixed! Your projects will now show up on the Explore page.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fixMissingUser();
