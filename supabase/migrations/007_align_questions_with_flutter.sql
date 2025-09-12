-- Alinear campos de questions con el modelo de Flutter

-- Renombrar question_text a question (como en Flutter)
ALTER TABLE public.questions RENAME COLUMN question_text TO question;

-- Renombrar question_type a type (como en Flutter)  
ALTER TABLE public.questions RENAME COLUMN question_type TO type;

-- Renombrar media_url a imageUrl (como en Flutter)
ALTER TABLE public.questions RENAME COLUMN media_url TO imageUrl;

-- Hacer que quiz_id sea opcional (como en Flutter)
ALTER TABLE public.questions ALTER COLUMN quiz_id DROP NOT NULL;
