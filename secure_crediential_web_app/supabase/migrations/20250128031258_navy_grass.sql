/*
  # Create credentials table and security policies

  1. New Tables
    - `credentials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `username` (text)
      - `encrypted_password` (text)
      - `description` (text, optional)
      - `url` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on credentials table
    - Add policies for:
      - Creating own credentials
      - Viewing own credentials
      - Updating own credentials
      - Deleting own credentials

  3. Triggers
    - Add updated_at trigger for automatic timestamp updates
*/

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own credentials"
  ON credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own credentials"
  ON credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON credentials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON credentials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credentials_updated_at
    BEFORE UPDATE ON credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();