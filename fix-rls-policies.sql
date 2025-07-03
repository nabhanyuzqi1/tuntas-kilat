-- Drop existing policies on the users table
DROP POLICY IF EXISTS "Admins can see all users" ON users;
DROP POLICY IF EXISTS "Users can see own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create a simple policy that allows all operations for testing
CREATE POLICY "Allow all operations for testing" ON users
  FOR ALL USING (true);

-- Note: Once testing is complete, you can replace with more restrictive policies