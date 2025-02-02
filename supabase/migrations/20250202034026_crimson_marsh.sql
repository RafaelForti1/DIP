/*
  # Police Officers Schema

  1. New Tables
    - `police_officers`
      - `id` (uuid, primary key) - Links to auth.users
      - `rg` (text) - RG number in the city
      - `rank` (text) - Officer's rank/patent
      - `qra` (text) - QRA identifier
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
  2. Security
    - Enable RLS on `police_officers` table
    - Add policies for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
*/

CREATE TABLE IF NOT EXISTS police_officers (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  rg text UNIQUE NOT NULL,
  rank text NOT NULL,
  qra text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE police_officers ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own data
CREATE POLICY "Users can read own data"
  ON police_officers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy to allow users to update their own data
CREATE POLICY "Users can update own data"
  ON police_officers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_police_officers_updated_at
  BEFORE UPDATE ON police_officers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();