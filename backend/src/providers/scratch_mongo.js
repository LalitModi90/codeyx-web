const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://codeyxAdmin:Ruchika7878@cluster0.bubjmca.mongodb.net/codeyx?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");
    
    // Dynamically retrieve collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    const db = mongoose.connection.db;
    const statsColl = db.collection('platformstats');
    const docs = await statsColl.find({}).toArray();
    
    console.log(`\nFound ${docs.length} platform stats records:`);
    docs.forEach(doc => {
      console.log(`- Platform: ${doc.platform}, Username: ${doc.username}, UserId: ${doc.userId}, Solved: ${doc.totalSolved}, Rating: ${doc.rating}`);
      if (doc.platform === 'codechef') {
        console.log("  CodeChef Submissions Count:", doc.stats?.submissions?.length || 0);
        console.log("  CodeChef Topics:", doc.stats?.topics);
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error running database query:", err);
    process.exit(1);
  }
}

run();
