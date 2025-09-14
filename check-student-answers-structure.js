import { supabase } from './src/services/supabase.js';

async function checkStudentAnswersStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla student_answers...');
    
    // Verificar la estructura de la tabla
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'student_answers')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error obteniendo estructura:', columnsError);
      return;
    }

    console.log('📋 Estructura de student_answers:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Verificar si hay datos de ejemplo
    const { data: sampleData, error: sampleError } = await supabase
      .from('student_answers')
      .select('*')
      .limit(3);

    if (sampleError) {
      console.error('❌ Error obteniendo datos de muestra:', sampleError);
    } else {
      console.log('📊 Datos de muestra:');
      console.log(JSON.stringify(sampleData, null, 2));
    }

    // Verificar las políticas RLS
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'student_answers')
      .eq('schemaname', 'public');

    if (policiesError) {
      console.error('❌ Error obteniendo políticas:', policiesError);
    } else {
      console.log('🔒 Políticas RLS activas:');
      policies.forEach(policy => {
        console.log(`   ${policy.policyname}: ${policy.cmd} - ${policy.qual}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkStudentAnswersStructure();
