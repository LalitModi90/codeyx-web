import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Profile } from './src/models/profile.model';
import clerkClient from '@clerk/clerk-sdk-node';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function fixEmptyUsernames() {
  try {
    if (!MONGO_URI) throw new Error("Missing MONGODB_URI");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const profilesWithoutData = await Profile.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' },
        { name: { $exists: false } },
        { name: null },
        { name: '' },
        { name: 'Developer' }
      ]
    });

    console.log(`Found ${profilesWithoutData.length} profiles needing username or name update.`);

    let updatedCount = 0;

    for (const profile of profilesWithoutData) {
      // Fetch directly from Clerk
      let clerkUser;
      try {
        clerkUser = await clerkClient.users.getUser(profile.userId);
      } catch (err) {
        console.error(`Could not fetch Clerk user for ${profile.userId}`);
      }
      
      let baseName = 'user';
      let fullName = 'Developer';
      
      if (clerkUser) {
        fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Developer';
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (clerkUser.firstName) {
          baseName = clerkUser.firstName.toLowerCase().replace(/[^a-z0-9_]/g, '');
        } else if (email) {
          baseName = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        }
      }

      // Generate a unique username
      let isUnique = false;
      let newUsername = '';
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        const randomDigits = Math.floor(Math.random() * 900000) + 100000;
        newUsername = `${baseName}_${randomDigits}`;
        
        // Check if unique in DB
        const existing = await Profile.findOne({ 
          username: { $regex: new RegExp(`^${newUsername}$`, 'i') } 
        });

        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      // Only assign if username is empty
      if (!profile.username) {
        if (isUnique) {
          profile.username = newUsername;
        } else {
          console.log(`❌ Failed to assign unique username for user ${profile.userId}`);
        }
      }

      // Also set the full name if it is missing or is 'Developer'
      if (!profile.name || profile.name === '' || profile.name === 'Developer') {
        profile.name = fullName;
      }

      await profile.save();
      console.log(`✅ Updated profile for user ${profile.userId} (Name: ${profile.name}, Username: ${profile.username})`);
      updatedCount++;
    }

    console.log(`\n🎉 Process complete! Successfully assigned usernames to ${updatedCount} profiles.`);
  } catch (error) {
    console.error("Script error:", error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

fixEmptyUsernames();
