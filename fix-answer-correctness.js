const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan las credenciales de Supabase en el archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAnswerCorrectness() {
  try {
    console.log('🔧 Corrigiendo respuestas incorrectas...');
    
    // Primero, vamos a ver qué respuestas tenemos
    const { data: allAnswers, error: fetchError } = await supabase
      .from('student_answers')
      .select(`
        id,
        student_id,
        question_id,
        answer,
        is_correct,
        answered_at,
        questions (
          id,
          correct_answer
        )
      `)
      .order('answered_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error obteniendo respuestas:', fetchError);
      return;
    }

    console.log(`📊 Total de respuestas encontradas: ${allAnswers.length}`);
    
    // Analizar las respuestas
    let correctCount = 0;
    let incorrectCount = 0;
    let needFixCount = 0;
    
    allAnswers.forEach(answer => {
      if (answer.questions) {
        const isActuallyCorrect = answer.answer === answer.questions.correct_answer;
        if (isActuallyCorrect && !answer.is_correct) {
          needFixCount++;
        }
        if (answer.is_correct) correctCount++;
        else incorrectCount++;
      }
    });
    
    console.log(`✅ Respuestas correctas actuales: ${correctCount}`);
    console.log(`❌ Respuestas incorrectas actuales: ${incorrectCount}`);
    console.log(`🔧 Respuestas que necesitan corrección: ${needFixCount}`);
    
    if (needFixCount === 0) {
      console.log('✅ No hay respuestas que necesiten corrección');
      return;
    }
    
    // Confirmar antes de hacer cambios
    console.log('\n⚠️  ¿Quieres corregir estas respuestas? (s/n)');
    
    // Para automatizar, vamos a proceder directamente
    console.log('🔧 Procediendo con la corrección...');
    
    // Corregir las respuestas incorrectas
    let fixedCount = 0;
    
    for (const answer of allAnswers) {
      if (answer.questions) {
        const isActuallyCorrect = answer.answer === answer.questions.correct_answer;
        
        // Si la respuesta es correcta pero está marcada como incorrecta
        if (isActuallyCorrect && !answer.is_correct) {
          const { error: updateError } = await supabase
            .from('student_answers')
            .update({ is_correct: true })
            .eq('id', answer.id);
          
          if (updateError) {
            console.error(`❌ Error actualizando respuesta ${answer.id}:`, updateError);
          } else {
            fixedCount++;
            console.log(`✅ Corregida respuesta ${answer.id}: "${answer.answer}" (debería ser correcta)`);
          }
        }
        
        // Si la respuesta es incorrecta pero está marcada como correcta
        if (!isActuallyCorrect && answer.is_correct) {
          const { error: updateError } = await supabase
            .from('student_answers')
            .update({ is_correct: false })
            .eq('id', answer.id);
          
          if (updateError) {
            console.error(`❌ Error actualizando respuesta ${answer.id}:`, updateError);
          } else {
            fixedCount++;
            console.log(`✅ Corregida respuesta ${answer.id}: "${answer.answer}" (debería ser incorrecta)`);
          }
        }
      }
    }
    
    console.log(`\n🎉 Corrección completada!`);
    console.log(`📊 Total de respuestas corregidas: ${fixedCount}`);
    
    // Verificar el resultado final
    const { data: finalAnswers, error: finalError } = await supabase
      .from('student_answers')
      .select('is_correct');
    
    if (!finalError) {
      const finalCorrect = finalAnswers.filter(a => a.is_correct).length;
      const finalIncorrect = finalAnswers.filter(a => !a.is_correct).length;
      
      console.log(`\n📈 Resultado final:`);
      console.log(`✅ Respuestas correctas: ${finalCorrect}`);
      console.log(`❌ Respuestas incorrectas: ${finalIncorrect}`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixAnswerCorrectness();
