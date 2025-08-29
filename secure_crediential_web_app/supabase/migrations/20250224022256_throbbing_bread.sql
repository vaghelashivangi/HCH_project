/*
  # Add master keys table

  1. New Tables
    - `master_keys`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `encrypted_key` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `master_keys` table
    - Add policies for authenticated users to manage their own master key
*/

CREATE TABLE IF NOT EXISTS master_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE master_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own master key"
  ON master_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own master key"
  ON master_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own master key"
  ON master_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own master key"
  ON master_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);