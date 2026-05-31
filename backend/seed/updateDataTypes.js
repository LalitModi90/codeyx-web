const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MasterProblemSchema = new mongoose.Schema(
  {
    problemId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    titleKey: { type: String, required: true, unique: true, index: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    platform: { type: String, default: '' },
    link: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    articleUrl: { type: String, default: '' },
    links: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false }
);

const MasterProblem = mongoose.models.MasterProblem || mongoose.model('MasterProblem', MasterProblemSchema);

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  const titleKey = 'data types';
  const targetLink = 'https://www.naukri.com/code360/problems/data-type_8357232';

  const result = await MasterProblem.updateOne(
    { titleKey },
    {
      $set: {
        platform: 'codestudio',
        link: targetLink,
        'links.codestudio': targetLink,
        'links.codingninjas': targetLink,
      }
    }
  );

  console.log('Update result:', result);
  await mongoose.disconnect();
  console.log('Disconnected.');
}

run().catch(console.error);
