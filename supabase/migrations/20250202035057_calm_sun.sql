/*
  # Update police officers table policies

  1. Security Changes
    - Add policy to allow insertion of records during signup
    - Keep existing policies for reading and updating own data
    - Ensure users can only manage their own records

  Note: This policy allows users to create their initial record during signup
*/

-- Enable RLS if not already enabled
ALTER TABLE police_officers ENABLE ROW LEVEL SECURITY;

-- Policy for inserting new records during signup
CREATE POLICY "Users can insert their own record"
  ON police_officers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for reading own data (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'police_officers' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON police_officers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Policy for updating own data (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'police_officers' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON police_officers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;