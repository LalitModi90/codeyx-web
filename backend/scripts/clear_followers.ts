import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI!;

async function clearFollowers() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db!;
  const result = await db.collection('followers').deleteMany({});
  console.log(`🗑️  Deleted ${result.deletedCount} follower document(s) from collection`);

  await mongoose.disconnect();
  console.log('✅ Done. All follow/following relationships cleared.');
}

clearFollowers().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
