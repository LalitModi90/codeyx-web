const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase keys in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedData() {
  try {
    console.log('📖 Reading local mock data (striver_a2z.json)...');
    const dataPath = path.resolve(__dirname, '../public/data/striver_a2z.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const problems = JSON.parse(rawData);

    console.log(`🚀 Found ${problems.length} problems. Uploading to Supabase...`);

    // Clean up IDs and prepare data for insert
    const insertData = problems.map(p => ({
      name: p.name,
      diff: p.diff,
      status: p.status,
      topic: p.topic,
      platforms: p.platforms,
      last: p.last
    }));

    // Insert in chunks of 50 to avoid payload size limits if it was huge
    const { error } = await supabase.from('problems').insert(insertData);

    if (error) {
      console.error('❌ Error inserting data into Supabase:', error.message);
    } else {
      console.log('✅ Successfully seeded Supabase with problems data!');
    }
  } catch (err) {
    console.error('❌ Script failed:', err);
  }
}

seedData();
