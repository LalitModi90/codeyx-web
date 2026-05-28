import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DsaSheet } from '../models/DsaSheet';
import { DsaStep } from '../models/DsaStep';
import { Problem } from '../models/Problem';

dotenv.config();

const sheetsData: any[] = [];
const striverProblems: any[] = [];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await DsaSheet.deleteMany({});
    await DsaStep.deleteMany({});
    await Problem.deleteMany({});
    console.log('Cleared existing data');

    console.log('\nSeeding completed successfully (cleared all sheets)!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
