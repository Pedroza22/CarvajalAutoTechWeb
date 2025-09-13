-- =====================================================
-- SCRIPT PARA CREAR TABLA STUDENT_EXPLANATIONS
-- =====================================================
-- Ejecuta este SQL en el dashboard de Supabase (SQL Editor)

-- 1. Crear la tabla principal
CREATE TABLE IF NOT EXISTS student_explanations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  category_name TEXT,
  explanations JSONB NOT NULL DEFAULT '[]'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by TEXT DEFAULT 'admin',
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'read')),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint único para evitar duplicados
  UNIQUE(student_id, category_id)
);

-- 2. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_student_explanations_student_id ON student_explanations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_explanations_category_id ON student_explanations(category_id);
CREATE INDEX IF NOT EXISTS idx_student_explanations_status ON student_explanations(status);
CREATE INDEX IF NOT EXISTS idx_student_explanations_sent_at ON student_explanations(sent_at);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE student_explanations ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de seguridad
-- Política para que los estudiantes solo vean sus propias explicaciones
CREATE POLICY "Students can view their own explanations" ON student_explanations
  FOR SELECT USING (auth.uid() = student_id);

-- Política para que los admins puedan insertar/actualizar explicaciones
CREATE POLICY "Admins can manage explanations" ON student_explanations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política para que los estudiantes puedan marcar como leído
CREATE POLICY "Students can mark as read" ON student_explanations
  FOR UPDATE USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- 5. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_student_explanations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_student_explanations_updated_at ON student_explanations;
CREATE TRIGGER trigger_update_student_explanations_updated_at
  BEFORE UPDATE ON student_explanations
  FOR EACH ROW
  EXECUTE FUNCTION update_student_explanations_updated_at();

-- 7. Comentarios para documentación
COMMENT ON TABLE student_explanations IS 'Tabla para almacenar explicaciones enviadas por admins a estudiantes';
COMMENT ON COLUMN student_explanations.explanations IS 'JSON con las explicaciones detalladas de las preguntas';
COMMENT ON COLUMN student_explanations.status IS 'Estado de la explicación: sent (enviada) o read (leída)';
COMMENT ON COLUMN student_explanations.sent_by IS 'Quién envió la explicación (admin, system, etc.)';

-- 8. Verificar que la tabla se creó correctamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_explanations' 
ORDER BY ordinal_position;

-- 9. Insertar datos de prueba (opcional)
-- INSERT INTO student_explanations (student_id, category_id, category_name, explanations, sent_by)
-- VALUES (
--   '9876310d-0577-4c09-b75f-0bc936e5c7e3', -- ID del estudiante de prueba
--   '4ceaf7a0-3c57-429d-bd7b-ec50d6ffa371', -- ID de categoría de prueba
--   'Heating & Air Conditioning',
--   '[{"question_id": "test", "explanation": "Esta es una explicación de prueba"}]',
--   'admin'
-- );

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================
-- 1. Ve al dashboard de Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega todo este script
-- 4. Ejecuta el script
-- 5. Verifica que la tabla se creó correctamente
-- =====================================================
