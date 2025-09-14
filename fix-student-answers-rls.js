import { supabase } from './src/services/supabase.js';

async function fixStudentAnswersRLS() {
  try {
    console.log('🔍 Verificando estructura de la tabla student_answers...');
    
    // Verificar la estructura de la tabla
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'student_answers')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('❌ Error obteniendo estructura de tabla:', columnsError);
      return;
    }

    console.log('📋 Estructura actual de student_answers:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Verificar si tiene student_id o attempt_id
    const hasStudentId = columns.some(col => col.column_name === 'student_id');
    const hasAttemptId = columns.some(col => col.column_name === 'attempt_id');

    console.log(`\n🔍 Análisis:`);
    console.log(`  - Tiene student_id: ${hasStudentId}`);
    console.log(`  - Tiene attempt_id: ${hasAttemptId}`);

    if (hasStudentId && !hasAttemptId) {
      console.log('\n✅ Esquema actual: student_answers con student_id directo');
      console.log('🔧 Aplicando políticas RLS correctas...');
      
      // Eliminar políticas existentes
      const dropPolicies = [
        'DROP POLICY IF EXISTS "Students can manage their own answers" ON public.student_answers;',
        'DROP POLICY IF EXISTS "Students can view their own answers" ON public.student_answers;',
        'DROP POLICY IF EXISTS "Students can insert their own answers" ON public.student_answers;',
        'DROP POLICY IF EXISTS "Students can update their own answers" ON public.student_answers;',
        'DROP POLICY IF EXISTS "Students can delete their own answers" ON public.student_answers;'
      ];

      for (const sql of dropPolicies) {
        try {
          await supabase.rpc('exec_sql', { sql });
          console.log('✅ Política eliminada');
        } catch (error) {
          console.warn('⚠️ Error eliminando política:', error.message);
        }
      }

      // Crear nuevas políticas para esquema con student_id
      const newPolicies = [
        `CREATE POLICY "Students can view their own answers" ON public.student_answers
          FOR SELECT USING (
            student_id = auth.uid() OR 
            EXISTS (
              SELECT 1 FROM public.app_users_enriched 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );`,
        
        `CREATE POLICY "Students can insert their own answers" ON public.student_answers
          FOR INSERT WITH CHECK (
            student_id = auth.uid() OR 
            EXISTS (
              SELECT 1 FROM public.app_users_enriched 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );`,
        
        `CREATE POLICY "Students can update their own answers" ON public.student_answers
          FOR UPDATE USING (
            student_id = auth.uid() OR 
            EXISTS (
              SELECT 1 FROM public.app_users_enriched 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );`,
        
        `CREATE POLICY "Students can delete their own answers" ON public.student_answers
          FOR DELETE USING (
            student_id = auth.uid() OR 
            EXISTS (
              SELECT 1 FROM public.app_users_enriched 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );`
      ];

      for (const sql of newPolicies) {
        try {
          await supabase.rpc('exec_sql', { sql });
          console.log('✅ Nueva política creada');
        } catch (error) {
          console.error('❌ Error creando política:', error.message);
        }
      }

    } else if (hasAttemptId && !hasStudentId) {
      console.log('\n✅ Esquema actual: student_answers con attempt_id');
      console.log('ℹ️ Las políticas actuales deberían funcionar');
    } else {
      console.log('\n❌ Esquema no reconocido o mixto');
    }

    // Verificar políticas actuales
    console.log('\n🔍 Verificando políticas RLS actuales...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, permissive, roles, qual')
      .eq('tablename', 'student_answers');

    if (policiesError) {
      console.warn('⚠️ No se pudieron obtener las políticas:', policiesError.message);
    } else {
      console.log('📋 Políticas actuales:');
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`);
      });
    }

    console.log('\n🎉 Proceso completado!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar
fixStudentAnswersRLS();
