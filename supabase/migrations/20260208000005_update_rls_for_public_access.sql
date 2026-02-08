-- Update RLS policies to allow public access (for when authentication is disabled)
-- 認証が無効化されている場合でもコース・セクション・レッスンにアクセスできるようにRLSポリシーを更新

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can view sections" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;

-- Create new policies that allow public access (anonymous users)
CREATE POLICY "Public can view courses"
  ON public.courses
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view sections"
  ON public.sections
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view lessons"
  ON public.lessons
  FOR SELECT
  TO anon, authenticated
  USING (true);
