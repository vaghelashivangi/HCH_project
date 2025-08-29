/*
  # Create feature requests table

  1. New Tables
    - `feature_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `feature_requests` table
    - Add policies for authenticated users to:
      - Create their own feature requests
      - Read their own feature requests
*/

CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own feature requests"
  ON feature_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feature requests"
  ON feature_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_feature_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feature_requests_updated_at
    BEFORE UPDATE ON feature_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_requests_updated_at();