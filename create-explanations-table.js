const { supabase } = require('./src/services/supabase');

async function createExplanationsTable() {
  console.log('🔧 Creando tabla student_explanations...');

  try {
    // Crear la tabla student_explanations
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS student_explanations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          student_id UUID NOT NULL REFERENCES app_users_enriched(id) ON DELETE CASCADE,
          category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          category_name TEXT,
          explanations JSONB NOT NULL,
          sent_at TIMESTAMPTZ DEFAULT NOW(),
          sent_by TEXT DEFAULT 'admin',
          status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'read')),
          read_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(student_id, category_id)
        );

        -- Crear índices para mejorar rendimiento
        CREATE INDEX IF NOT EXISTS idx_student_explanations_student_id ON student_explanations(student_id);
        CREATE INDEX IF NOT EXISTS idx_student_explanations_category_id ON student_explanations(category_id);
        CREATE INDEX IF NOT EXISTS idx_student_explanations_status ON student_explanations(status);
        CREATE INDEX IF NOT EXISTS idx_student_explanations_sent_at ON student_explanations(sent_at);

        -- Habilitar RLS (Row Level Security)
        ALTER TABLE student_explanations ENABLE ROW LEVEL SECURITY;

        -- Política para que los estudiantes puedan ver sus propias explicaciones
        CREATE POLICY IF NOT EXISTS "Students can view their own explanations" ON student_explanations
          FOR SELECT USING (student_id = auth.uid()::uuid);

        -- Política para que los administradores puedan hacer todo
        CREATE POLICY IF NOT EXISTS "Admins can manage all explanations" ON student_explanations
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM app_users_enriched 
              WHERE id = auth.uid()::uuid 
              AND raw_user_meta_data->>'role' = 'admin'
            )
          );

        -- Política para que los estudiantes puedan marcar como leído
        CREATE POLICY IF NOT EXISTS "Students can mark as read" ON student_explanations
          FOR UPDATE USING (student_id = auth.uid()::uuid);

        -- Función para actualizar updated_at automáticamente
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Trigger para actualizar updated_at
        DROP TRIGGER IF EXISTS update_student_explanations_updated_at ON student_explanations;
        CREATE TRIGGER update_student_explanations_updated_at
          BEFORE UPDATE ON student_explanations
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (error) {
      console.error('❌ Error creando tabla:', error);
      return false;
    }

    console.log('✅ Tabla student_explanations creada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error en createExplanationsTable:', error);
    return false;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createExplanationsTable();
}

module.exports = { createExplanationsTable };
