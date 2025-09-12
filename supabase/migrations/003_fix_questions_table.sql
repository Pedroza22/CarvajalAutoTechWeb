-- Fix questions table to make quiz_id optional
-- This allows questions to exist without requiring a quiz

-- First, make quiz_id nullable
ALTER TABLE public.questions ALTER COLUMN quiz_id DROP NOT NULL;

-- Add a default value for quiz_id (can be NULL)
-- This allows questions to be created independently of quizzes

-- Add category_id to questions table for direct categorization
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- Add created_by to questions table
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS questions_category_id_idx ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS questions_created_by_idx ON public.questions(created_by);
CREATE INDEX IF NOT EXISTS questions_quiz_id_idx ON public.questions(quiz_id);
