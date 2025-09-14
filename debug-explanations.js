const { supabase } = require('./src/services/supabase');

async function debugExplanations() {
  console.log('🔍 Debugging sistema de explicaciones...\n');

  try {
    // 1. Verificar si la tabla student_explanations existe
    console.log('1. Verificando tabla student_explanations...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('student_explanations')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('❌ Tabla student_explanations no existe o no es accesible:', tableError.message);
    } else {
      console.log('✅ Tabla student_explanations existe y es accesible');
      console.log('📊 Registros en la tabla:', tableCheck?.length || 0);
    }

    // 2. Verificar localStorage
    console.log('\n2. Verificando localStorage...');
    const localStorageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('explanations_') || key.includes('student_explanations_'))) {
        localStorageKeys.push(key);
      }
    }
    
    console.log('📝 Claves de localStorage relacionadas con explicaciones:', localStorageKeys);
    
    for (const key of localStorageKeys) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`   ${key}:`, data);
      } catch (e) {
        console.log(`   ${key}: Error parseando -`, localStorage.getItem(key));
      }
    }

    // 3. Verificar tabla student_categories
    console.log('\n3. Verificando tabla student_categories...');
    const { data: studentCategories, error: scError } = await supabase
      .from('student_categories')
      .select('*')
      .limit(5);

    if (scError) {
      console.log('❌ Error accediendo a student_categories:', scError.message);
    } else {
      console.log('✅ student_categories accesible');
      console.log('📊 Registros de ejemplo:', studentCategories);
    }

    // 4. Verificar tabla student_answers
    console.log('\n4. Verificando tabla student_answers...');
    const { data: studentAnswers, error: saError } = await supabase
      .from('student_answers')
      .select('*')
      .limit(5);

    if (saError) {
      console.log('❌ Error accediendo a student_answers:', saError.message);
    } else {
      console.log('✅ student_answers accesible');
      console.log('📊 Registros de ejemplo:', studentAnswers);
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  debugExplanations();
}

module.exports = { debugExplanations };
