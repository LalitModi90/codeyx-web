const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MasterProblemSchema = new mongoose.Schema(
  {
    problemId: { type: Number, required: true },
    title: { type: String, required: true },
    titleKey: { type: String, required: true },
    platform: { type: String, default: '' },
    link: { type: String, default: '' },
    links: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { strict: false }
);

const MasterProblem = mongoose.models.MasterProblem || mongoose.model('MasterProblem', MasterProblemSchema);

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const problems = await MasterProblem.find({
    titleKey: { $in: ['selection sort', 'if else statements'] }
  }).lean();

  console.log('Problems found:', JSON.stringify(problems, null, 2));
  await mongoose.disconnect();
}

run().catch(console.error);
