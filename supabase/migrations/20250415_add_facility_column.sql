
-- Add facility column to users_log if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_attribute
    WHERE attrelid = 'users_log'::regclass
    AND attname = 'facility'
    AND NOT attisdropped
  ) THEN
    ALTER TABLE users_log ADD COLUMN facility TEXT DEFAULT 'Unknown';
  END IF;
END $$;

-- Enable Row Level Security on users_log
ALTER TABLE users_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to see all users
CREATE POLICY "Admins can see all users"
ON users_log
FOR SELECT
USING (
  (auth.uid() IN (SELECT user_id FROM users_log WHERE role = 'Admin')) OR
  auth.uid() = user_id
);

-- Create policy for admin users to insert users
CREATE POLICY "Admins can insert users"
ON users_log
FOR INSERT
WITH CHECK (
  (auth.uid() IN (SELECT user_id FROM users_log WHERE role = 'Admin'))
);

-- Create policy for admin users to update users
CREATE POLICY "Admins can update users"
ON users_log
FOR UPDATE
USING (
  (auth.uid() IN (SELECT user_id FROM users_log WHERE role = 'Admin')) OR
  auth.uid() = user_id
);

-- Create policy for admin users to delete users
CREATE POLICY "Admins can delete users"
ON users_log
FOR DELETE
USING (
  (auth.uid() IN (SELECT user_id FROM users_log WHERE role = 'Admin'))
);

-- Create initial admin function caller
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM users_log
    WHERE user_id = auth.uid()
    AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
