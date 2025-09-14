const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan las credenciales de Supabase en el archivo .env');
  console.log('Asegúrate de tener:');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTotalTimeColumn() {
  try {
    console.log('🔧 Agregando columna total_time_minutes a student_answers...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'supabase', 'migrations', '015_add_total_time_to_student_answers.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar la migración
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error ejecutando migración:', error);
      return;
    }
    
    console.log('✅ Columna total_time_minutes agregada exitosamente');
    console.log('📊 Verificando estructura de la tabla...');
    
    // Verificar que la columna fue agregada
    const { data: columns, error: columnError } = await supabase
      .from('student_answers')
      .select('*')
      .limit(1);
    
    if (columnError) {
      console.error('❌ Error verificando tabla:', columnError);
    } else {
      console.log('✅ Tabla student_answers verificada correctamente');
      console.log('📋 Columnas disponibles:', Object.keys(columns[0] || {}));
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

addTotalTimeColumn();
