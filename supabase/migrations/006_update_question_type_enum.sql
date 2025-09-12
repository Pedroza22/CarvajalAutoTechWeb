-- Actualizar el enum question_type para que coincida con Flutter
-- Primero, crear el nuevo enum
CREATE TYPE question_type_new AS ENUM ('multipleChoice', 'trueFalse', 'freeText');

-- Actualizar la tabla para usar el nuevo enum
ALTER TABLE public.questions 
ALTER COLUMN question_type TYPE question_type_new 
USING question_type::text::question_type_new;

-- Eliminar el enum viejo
DROP TYPE question_type;

-- Renombrar el nuevo enum
ALTER TYPE question_type_new RENAME TO question_type;
