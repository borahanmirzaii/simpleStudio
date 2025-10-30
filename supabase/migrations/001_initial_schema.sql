-- Create generations table for storing video generation data
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  video_url TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries on completed generations
CREATE INDEX IF NOT EXISTS idx_generations_completed
ON generations(completed_at DESC)
WHERE status = 'completed';

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_generations_status
ON generations(status);

-- Create index for created_at queries
CREATE INDEX IF NOT EXISTS idx_generations_created_at
ON generations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (adjust based on auth needs)
CREATE POLICY "Allow all operations" ON generations
FOR ALL
USING (true)
WITH CHECK (true);

-- Create a simple test function to verify connection
CREATE OR REPLACE FUNCTION test_connection()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'Database connection successful!';
END;
$$;
