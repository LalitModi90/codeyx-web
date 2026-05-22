-- Supabase SQL Schema for Problems Dashboard

-- 1. Create the problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  diff TEXT NOT NULL,
  status TEXT DEFAULT 'Unsolved',
  topic TEXT,
  platforms JSONB,
  last TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Setup Row Level Security (RLS)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow public read access (for demo purposes)
-- NOTE: In a real app with users, you would restrict this to authenticated users
CREATE POLICY "Allow public read access" 
  ON problems
  FOR SELECT
  USING (true);

-- 4. Create a policy to allow public insert (so we can seed it via our anon key)
CREATE POLICY "Allow public insert" 
  ON problems
  FOR INSERT
  WITH CHECK (true);

-- 5. Create a policy to allow public update (for changing status)
CREATE POLICY "Allow public update" 
  ON problems
  FOR UPDATE
  USING (true);
