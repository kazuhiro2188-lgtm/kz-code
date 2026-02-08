-- Create lesson_completions and learning_history tables
-- Task: 1.3 - 学習進捗テーブルと RLS ポリシーの作成
-- Requirements: 6.1, 6.4, 10.2

-- Create lesson_completions table
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create learning_history table
CREATE TABLE IF NOT EXISTS public.learning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lesson_completions
-- Policy: Users can SELECT their own completions
CREATE POLICY "Users can view their own lesson completions"
  ON public.lesson_completions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own completions
CREATE POLICY "Users can insert their own lesson completions"
  ON public.lesson_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for learning_history
-- Policy: Users can SELECT their own learning history
CREATE POLICY "Users can view their own learning history"
  ON public.learning_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own learning history
CREATE POLICY "Users can insert their own learning history"
  ON public.learning_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS lesson_completions_user_id_lesson_id_idx 
  ON public.lesson_completions(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS learning_history_user_id_accessed_at_idx 
  ON public.learning_history(user_id, accessed_at);
CREATE INDEX IF NOT EXISTS lesson_completions_lesson_id_idx 
  ON public.lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS learning_history_lesson_id_idx 
  ON public.learning_history(lesson_id);
