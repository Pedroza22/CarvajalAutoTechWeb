// Script para probar la detección automática del modo demo
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://72.60.53.240:8000/';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ';

console.log('🔍 Probando detección automática del modo demo...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDemoModeDetection() {
  try {
    console.log('\n🔄 Test 1: Verificando sesión...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message.includes('JWSInvalidSignature')) {
      console.log('✅ Detectado: JWSInvalidSignature - Modo demo activado');
      return true;
    }
    
    console.log('\n🔄 Test 2: Verificando consulta a tabla...');
    const { error: queryError } = await supabase
      .from('categories')
      .select('count(*)')
      .limit(1);
    
    if (queryError && (queryError.message.includes('JWSInvalidSignature') || queryError.message.includes('401'))) {
      console.log('✅ Detectado: Error de consulta - Modo demo activado');
      return true;
    }
    
    console.log('✅ Supabase está funcionando - Modo normal');
    return false;
    
  } catch (error) {
    console.log('✅ Detectado: Error general - Modo demo activado');
    return true;
  }
}

testDemoModeDetection().then(isDemoMode => {
  console.log(`\n🎯 RESULTADO: ${isDemoMode ? 'MODO DEMO' : 'MODO NORMAL'}`);
  console.log('\n💡 La aplicación detectará automáticamente este estado');
});

