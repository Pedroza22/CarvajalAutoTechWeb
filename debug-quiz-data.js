const { supabase } = require('./src/services/supabase');

async function debugQuizData() {
  console.log('🔍 Debugging datos de quiz...\n');

  try {
    // 1. Verificar datos en student_answers
    console.log('1. Verificando tabla student_answers...');
    const { data: answers, error: answersError } = await supabase
      .from('student_answers')
      .select('*')
      .limit(10);

    if (answersError) {
      console.log('❌ Error accediendo a student_answers:', answersError.message);
    } else {
      console.log('✅ student_answers accesible');
      console.log('📊 Muestra de respuestas:', answers?.slice(0, 3));
    }

    // 2. Verificar preguntas en una categoría específica
    console.log('\n2. Verificando preguntas por categoría...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, category_id')
      .limit(10);

    if (questionsError) {
      console.log('❌ Error accediendo a questions:', questionsError.message);
    } else {
      console.log('✅ questions accesible');
      console.log('📊 Muestra de preguntas:', questions?.slice(0, 3));
      
      // Contar por categoría
      const categoryCounts = {};
      questions?.forEach(q => {
        categoryCounts[q.category_id] = (categoryCounts[q.category_id] || 0) + 1;
      });
      console.log('📊 Preguntas por categoría:', categoryCounts);
    }

    // 3. Verificar respuestas de un estudiante específico
    console.log('\n3. Verificando respuestas de estudiante...');
    const { data: studentAnswers, error: studentError } = await supabase
      .from('student_answers')
      .select(`
        student_id,
        is_correct,
        answered_at,
        questions (
          category_id
        )
      `)
      .limit(20);

    if (studentError) {
      console.log('❌ Error obteniendo respuestas de estudiante:', studentError.message);
    } else {
      console.log('✅ Respuestas de estudiante obtenidas');
      console.log('📊 Total respuestas encontradas:', studentAnswers?.length || 0);
      
      if (studentAnswers && studentAnswers.length > 0) {
        const correctCount = studentAnswers.filter(a => a.is_correct === true).length;
        const incorrectCount = studentAnswers.filter(a => a.is_correct === false).length;
        console.log('📊 Correctas:', correctCount);
        console.log('📊 Incorrectas:', incorrectCount);
        console.log('📊 Muestra de respuestas:', studentAnswers.slice(0, 3));
      }
    }

    // 4. Verificar categorías asignadas
    console.log('\n4. Verificando categorías asignadas...');
    const { data: studentCategories, error: categoriesError } = await supabase
      .from('student_categories')
      .select('*')
      .limit(5);

    if (categoriesError) {
      console.log('❌ Error accediendo a student_categories:', categoriesError.message);
    } else {
      console.log('✅ student_categories accesible');
      console.log('📊 Categorías asignadas:', studentCategories);
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  debugQuizData();
}

module.exports = { debugQuizData };
