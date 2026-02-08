-- サンプルコースデータの登録スクリプト
-- SupabaseダッシュボードのSQL Editorで実行してください

-- コース1: AI駆動開発の基礎
INSERT INTO public.courses (id, title, description, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'AI駆動開発の基礎',
  'AIと協働する開発手法の基本を学ぶコースです。プロンプトエンジニアリングからAIツールの統合まで、実践的なスキルを習得できます。',
  1
)
ON CONFLICT (id) DO NOTHING;

-- セクション1: プロンプトエンジニアリング入門
INSERT INTO public.sections (id, course_id, title, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'プロンプトエンジニアリング入門',
  1
)
ON CONFLICT (id) DO NOTHING;

-- レッスン1-1: プロンプトの基本
INSERT INTO public.lessons (id, section_id, title, content_path, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000011',
  'プロンプトの基本',
  'course1/section1/lesson1.mdx',
  1
)
ON CONFLICT (id) DO NOTHING;

-- レッスン1-2: 効果的なプロンプト設計
INSERT INTO public.lessons (id, section_id, title, content_path, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000011',
  '効果的なプロンプト設計',
  'course1/section1/lesson2.mdx',
  2
)
ON CONFLICT (id) DO NOTHING;

-- セクション2: AIツールの統合
INSERT INTO public.sections (id, course_id, title, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'AIツールの統合',
  2
)
ON CONFLICT (id) DO NOTHING;

-- レッスン2-1: AIツールの選び方
INSERT INTO public.lessons (id, section_id, title, content_path, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000012',
  'AIツールの選び方',
  'course1/section2/lesson1.mdx',
  1
)
ON CONFLICT (id) DO NOTHING;

-- コース2: 高度なAI活用テクニック
INSERT INTO public.courses (id, title, description, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '高度なAI活用テクニック',
  'より高度なAI活用方法を学ぶコースです。AIアーキテクチャ設計から、実践的なワークフロー構築までをカバーします。',
  2
)
ON CONFLICT (id) DO NOTHING;

-- セクション1: AIアーキテクチャ設計
INSERT INTO public.sections (id, course_id, title, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000002',
  'AIアーキテクチャ設計',
  1
)
ON CONFLICT (id) DO NOTHING;

-- レッスン1-1: AIシステムの設計原則
INSERT INTO public.lessons (id, section_id, title, content_path, order_index)
VALUES (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000021',
  'AIシステムの設計原則',
  'course2/section1/lesson1.mdx',
  1
)
ON CONFLICT (id) DO NOTHING;
