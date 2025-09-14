import { supabase } from './src/services/supabase.js';

async function testStudentAnswers() {
  try {
    console.log('🔍 Probando acceso a student_answers...');
    
    // Intentar obtener datos de la tabla
    const { data, error } = await supabase
      .from('student_answers')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accediendo a student_answers:', error);
      return;
    }

    console.log('✅ Acceso exitoso a student_answers');
    console.log('📊 Datos encontrados:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📋 Estructura de datos:');
      console.log(JSON.stringify(data[0], null, 2));
    }

    // Intentar insertar un dato de prueba
    console.log('\n🧪 Probando inserción...');
    const testData = {
      student_id: 'test-student-id',
      question_id: 'test-question-id',
      answer: 'test-answer',
      is_correct: false,
      answered_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('student_answers')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ Error en inserción de prueba:', insertError);
    } else {
      console.log('✅ Inserción de prueba exitosa');
      console.log('📝 Datos insertados:', insertData);
      
      // Limpiar datos de prueba
      const { error: deleteError } = await supabase
        .from('student_answers')
        .delete()
        .eq('student_id', 'test-student-id');
      
      if (deleteError) {
        console.error('⚠️ Error limpiando datos de prueba:', deleteError);
      } else {
        console.log('🧹 Datos de prueba limpiados');
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testStudentAnswers();
