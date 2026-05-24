const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://codeyxAdmin:Ruchika7878@cluster0.bubjmca.mongodb.net/codeyx?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB\n');

  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}, { projection: { clerkUserId: 1, email: 1, firstName: 1, lastName: 1 }}).toArray();
  const stats = await db.collection('platformstats').find({}, { projection: { userId: 1, platform: 1, username: 1, totalSolved: 1, rating: 1 }}).toArray();

  console.log('=== USERS IN DB ===');
  users.forEach(u => console.log(`  clerkUserId: "${u.clerkUserId}" | email: ${u.email} | name: ${u.firstName} ${u.lastName}`));

  console.log('\n=== PLATFORM STATS IN DB ===');
  stats.forEach(s => console.log(`  userId: "${s.userId}" | platform: ${s.platform} | username: ${s.username} | solved: ${s.totalSolved} | rating: ${s.rating}`));

  console.log('\n=== MATCH CHECK (userId in stats vs clerkUserId in users) ===');
  const userIds = new Set(users.map(u => u.clerkUserId));
  const statUserIds = [...new Set(stats.map(s => s.userId))];
  statUserIds.forEach(sid => {
    const matched = userIds.has(sid);
    console.log(`  Stats userId "${sid}" -> match found: ${matched}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
