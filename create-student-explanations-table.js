const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStudentExplanationsTable() {
  try {
    console.log('🚀 Creando tabla student_explanations...');

    // SQL para crear la tabla
    const createTableSQL = `
      -- Crear tabla student_explanations para almacenar explicaciones enviadas a estudiantes
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
    `;

    // Ejecutar la creación de la tabla
    const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.error('❌ Error creando tabla:', createError);
      // Intentar método alternativo
      console.log('🔄 Intentando método alternativo...');
      
      // Verificar si la tabla ya existe
      const { data: checkTable, error: checkError } = await supabase
        .from('student_explanations')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        console.log('📋 Tabla no existe, creándola...');
        // La tabla no existe, necesitamos crearla manualmente en el dashboard de Supabase
        console.log('⚠️ Por favor, ejecuta este SQL en el dashboard de Supabase:');
        console.log(createTableSQL);
        return;
      } else if (checkError) {
        console.error('❌ Error verificando tabla:', checkError);
        return;
      } else {
        console.log('✅ La tabla student_explanations ya existe');
      }
    } else {
      console.log('✅ Tabla student_explanations creada exitosamente');
    }

    // Crear índices
    console.log('🔍 Creando índices...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_student_explanations_student_id ON student_explanations(student_id);',
      'CREATE INDEX IF NOT EXISTS idx_student_explanations_category_id ON student_explanations(category_id);',
      'CREATE INDEX IF NOT EXISTS idx_student_explanations_status ON student_explanations(status);',
      'CREATE INDEX IF NOT EXISTS idx_student_explanations_sent_at ON student_explanations(sent_at);'
    ];

    for (const indexSQL of indexes) {
      try {
        await supabase.rpc('exec_sql', { sql: indexSQL });
        console.log('✅ Índice creado');
      } catch (indexError) {
        console.warn('⚠️ Error creando índice:', indexError.message);
      }
    }

    // Habilitar RLS
    console.log('🔒 Configurando RLS...');
    const rlsSQL = 'ALTER TABLE student_explanations ENABLE ROW LEVEL SECURITY;';
    try {
      await supabase.rpc('exec_sql', { sql: rlsSQL });
      console.log('✅ RLS habilitado');
    } catch (rlsError) {
      console.warn('⚠️ Error configurando RLS:', rlsError.message);
    }

    // Crear políticas
    console.log('📋 Creando políticas...');
    const policies = [
      `CREATE POLICY "Students can view their own explanations" ON student_explanations
        FOR SELECT USING (auth.uid() = student_id);`,
      `CREATE POLICY "Admins can manage explanations" ON student_explanations
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
          )
        );`,
      `CREATE POLICY "Students can mark as read" ON student_explanations
        FOR UPDATE USING (auth.uid() = student_id)
        WITH CHECK (auth.uid() = student_id);`
    ];

    for (const policySQL of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policySQL });
        console.log('✅ Política creada');
      } catch (policyError) {
        console.warn('⚠️ Error creando política:', policyError.message);
      }
    }

    console.log('🎉 Configuración completada!');
    console.log('📝 Si hay errores, ejecuta manualmente en el dashboard de Supabase:');
    console.log(createTableSQL);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar
createStudentExplanationsTable();
