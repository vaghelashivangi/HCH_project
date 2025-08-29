-- Previous content remains...

-- Add stored procedure for user self-deletion
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user's data
  DELETE FROM credentials WHERE user_id = auth.uid();
  DELETE FROM master_keys WHERE user_id = auth.uid();
  DELETE FROM feature_requests WHERE user_id = auth.uid();
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user TO authenticated;