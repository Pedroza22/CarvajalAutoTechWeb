-- Agregar campos para explicaciones en la tabla student_categories
ALTER TABLE student_categories 
ADD COLUMN IF NOT EXISTS explanations_sent TEXT,
ADD COLUMN IF NOT EXISTS explanations_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS explanations_status TEXT DEFAULT 'sent' CHECK (explanations_status IN ('sent', 'read')),
ADD COLUMN IF NOT EXISTS explanations_read_at TIMESTAMP WITH TIME ZONE;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_student_categories_explanations_status ON student_categories(explanations_status);
CREATE INDEX IF NOT EXISTS idx_student_categories_explanations_sent_at ON student_categories(explanations_sent_at);

-- Comentarios para documentación
COMMENT ON COLUMN student_categories.explanations_sent IS 'Contenido de las explicaciones enviadas al estudiante';
COMMENT ON COLUMN student_categories.explanations_sent_at IS 'Fecha y hora de envío de las explicaciones';
COMMENT ON COLUMN student_categories.explanations_status IS 'Estado de las explicaciones: sent (enviado) o read (leído)';
COMMENT ON COLUMN student_categories.explanations_read_at IS 'Fecha y hora de lectura de las explicaciones por el estudiante';
