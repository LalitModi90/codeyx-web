const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const result = await mongoose.connection.db.collection('followers').deleteMany({});
  console.log(`🗑️  Deleted ${result.deletedCount} follower/following record(s)`);

  await mongoose.disconnect();
  console.log('✅ Done — all follow counts are now 0.');
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
