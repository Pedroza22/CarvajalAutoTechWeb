#!/usr/bin/env node

/**
 * Script rápido para verificar la conectividad básica con Supabase
 * Uso: node scripts/quick-connection-test.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://72.60.53.240:8000/';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ';

console.log('🚀 Test rápido de conexión Supabase...\n');

async function quickTest() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test básico de autenticación
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Error:', error.message);
      return false;
    }
    
    console.log('✅ Conexión exitosa con Supabase!');
    console.log(`📍 URL: ${supabaseUrl}`);
    console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...`);
    
    return true;
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    return false;
  }
}

quickTest().then(success => {
  process.exit(success ? 0 : 1);
});

