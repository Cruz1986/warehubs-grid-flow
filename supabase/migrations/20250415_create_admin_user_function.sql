
-- Create a function to create the first admin user bypassing RLS
CREATE OR REPLACE FUNCTION create_admin_user(admin_username TEXT, admin_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This will run with the privileges of the creating user (typically the owner of the database)
AS $$
DECLARE
  admin_count INTEGER;
  new_user JSONB;
BEGIN
  -- Check if there's already an admin user
  SELECT COUNT(*) INTO admin_count FROM users_log WHERE role = 'Admin';
  
  IF admin_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'An admin user already exists');
  END IF;
  
  -- Create the admin user
  INSERT INTO users_log (username, password, role, facility, status)
  VALUES (admin_username, admin_password, 'Admin', 'All', 'active')
  RETURNING to_jsonb(users_log.*) INTO new_user;
  
  RETURN jsonb_build_object('success', true, 'user', new_user);
END;
$$;

-- Grant execute permission to this function to the anon and authenticated roles
GRANT EXECUTE ON FUNCTION create_admin_user TO anon, authenticated;
