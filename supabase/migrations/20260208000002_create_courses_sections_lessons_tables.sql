-- Create courses, sections, and lessons tables
-- Task: 1.2 - コース・セクション・レッスンテーブルと RLS ポリシーの作成
-- Requirements: 4.3, 10.2

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_path TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for courses (read-only for authenticated users)
CREATE POLICY "Authenticated users can view courses"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for sections (read-only for authenticated users)
CREATE POLICY "Authenticated users can view sections"
  ON public.sections
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for lessons (read-only for authenticated users)
CREATE POLICY "Authenticated users can view lessons"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS sections_course_id_idx ON public.sections(course_id);
CREATE INDEX IF NOT EXISTS lessons_section_id_idx ON public.lessons(section_id);
CREATE INDEX IF NOT EXISTS courses_order_index_idx ON public.courses(order_index);
CREATE INDEX IF NOT EXISTS sections_order_index_idx ON public.sections(order_index);
CREATE INDEX IF NOT EXISTS lessons_order_index_idx ON public.lessons(order_index);
