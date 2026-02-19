-- ================================================================
-- 🔧 Fix: Allow trigger to create profiles
-- ================================================================

-- Solution: Modify the trigger function to bypass RLS
-- Using SECURITY DEFINER with explicit permission grants

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function with proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  username_base TEXT;
  final_username TEXT;
  username_counter INTEGER := 0;
  display_name_value TEXT;
BEGIN
  -- Extract username from email (before @) and sanitize it
  username_base := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  
  -- Ensure username is not empty
  IF username_base = '' OR username_base IS NULL THEN
    username_base := 'user';
  END IF;
  
  final_username := username_base;
  
  -- Check if username exists and add counter if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    username_counter := username_counter + 1;
    final_username := username_base || username_counter::TEXT;
  END LOOP;

  -- Prepare display_name safely
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    display_name_value := COALESCE(
      NEW.raw_user_meta_data->>'displayName',
      NEW.raw_user_meta_data->>'display_name', 
      NEW.raw_user_meta_data->>'name'
    );
  END IF;
  
  -- Fallback to email prefix
  IF display_name_value IS NULL OR display_name_value = '' THEN
    display_name_value := SPLIT_PART(NEW.email, '@', 1);
  END IF;
  
  -- Insert profile (RLS is bypassed because of SECURITY DEFINER)
  INSERT INTO public.profiles (id, username, display_name, created_at, updated_at)
  VALUES (NEW.id, final_username, display_name_value, NOW(), NOW());
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policy to allow service role to insert
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Ensure the existing policy still works for users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- ================================================================
-- ✅ Fix Applied
-- Now the trigger should be able to create profiles automatically
-- ================================================================
