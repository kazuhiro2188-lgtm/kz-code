-- 動作確認用 SQL クエリ
-- このファイルは Supabase Dashboard の SQL Editor で実行して、マイグレーションが正しく適用されたか確認します

-- ============================================
-- 1. テーブルの存在確認
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- ============================================
-- 2. テーブル構造の確認
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- 3. RLS が有効化されているか確認
-- ============================================
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- ============================================
-- 4. RLS ポリシーの確認
-- ============================================
SELECT 
  policyname,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- 5. 外部キー制約の確認
-- ============================================
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'profiles';

-- ============================================
-- 6. インデックスの確認
-- ============================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- ============================================
-- 7. トリガーの確認
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'profiles';

-- ============================================
-- 8. 関数の確認
-- ============================================
SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_updated_at';

-- ============================================
-- 9. 現在のユーザー ID の確認（認証が必要）
-- ============================================
-- 注意: このクエリは認証済みユーザーとして実行する必要があります
SELECT auth.uid() AS current_user_id;

-- ============================================
-- 10. テストデータの挿入（オプション）
-- ============================================
-- 注意: 実際のユーザー ID に置き換えてください
-- INSERT INTO public.profiles (id, onboarding_completed, learning_goal, experience_level)
-- VALUES (
--   auth.uid(),  -- 現在のユーザー ID を使用
--   false,
--   'AI駆動開発の基礎を学ぶ',
--   'beginner'
-- );

-- ============================================
-- 11. テストデータの確認（オプション）
-- ============================================
-- SELECT * FROM public.profiles WHERE id = auth.uid();

-- ============================================
-- 12. 自動更新トリガーのテスト（オプション）
-- ============================================
-- 1. 現在の updated_at を確認
-- SELECT id, updated_at FROM public.profiles WHERE id = auth.uid();
--
-- 2. 少し待つ（1秒程度）
--
-- 3. プロフィールを更新
-- UPDATE public.profiles 
-- SET learning_goal = 'AI駆動開発の上級を学ぶ'
-- WHERE id = auth.uid();
--
-- 4. updated_at が自動的に更新されたか確認
-- SELECT id, updated_at FROM public.profiles WHERE id = auth.uid();
