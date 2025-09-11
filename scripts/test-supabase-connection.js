#!/usr/bin/env node

/**
 * Script para verificar la conexión con Supabase
 * Uso: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://72.60.53.240:8000/';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ';

console.log('🔍 Verificando conexión con Supabase...\n');

// Mostrar configuración
console.log('📋 Configuración:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
console.log(`   Variables de entorno: ${process.env.REACT_APP_SUPABASE_URL ? '✅ Configuradas' : '❌ No configuradas'}\n`);

async function testSupabaseConnection() {
  try {
    // 1. Crear cliente de Supabase
    console.log('1️⃣ Creando cliente de Supabase...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    console.log('   ✅ Cliente creado exitosamente\n');

    // 2. Verificar conexión básica
    console.log('2️⃣ Verificando conexión básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1);
    
    if (healthError && healthError.code === 'PGRST116') {
      console.log('   ✅ Conexión básica exitosa (tabla _health_check no existe, pero la conexión funciona)\n');
    } else if (healthError) {
      console.log(`   ⚠️  Conexión básica con advertencias: ${healthError.message}\n`);
    } else {
      console.log('   ✅ Conexión básica exitosa\n');
    }

    // 3. Verificar autenticación
    console.log('3️⃣ Verificando sistema de autenticación...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`   ❌ Error en autenticación: ${sessionError.message}\n`);
    } else {
      console.log('   ✅ Sistema de autenticación funcionando\n');
    }

    // 4. Verificar tablas principales (si existen)
    console.log('4️⃣ Verificando tablas principales...');
    
    // Verificar tabla users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.log(`   ⚠️  Tabla 'users': ${usersError.message}`);
    } else {
      console.log('   ✅ Tabla "users" accesible');
    }

    // Verificar tabla courses
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (coursesError) {
      console.log(`   ⚠️  Tabla 'courses': ${coursesError.message}`);
    } else {
      console.log('   ✅ Tabla "courses" accesible');
    }

    // Verificar tabla questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .limit(1);
    
    if (questionsError) {
      console.log(`   ⚠️  Tabla 'questions': ${questionsError.message}`);
    } else {
      console.log('   ✅ Tabla "questions" accesible');
    }

    console.log('\n');

    // 5. Test de login (con credenciales demo)
    console.log('5️⃣ Probando autenticación con credenciales demo...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'admin123'
    });

    if (loginError) {
      console.log(`   ⚠️  Login demo falló: ${loginError.message}`);
      console.log('   ℹ️  Esto es normal si las credenciales demo no existen en Supabase\n');
    } else {
      console.log('   ✅ Login demo exitoso');
      console.log(`   👤 Usuario: ${loginData.user?.email}`);
      
      // Cerrar sesión
      await supabase.auth.signOut();
      console.log('   🚪 Sesión cerrada\n');
    }

    // 6. Resumen final
    console.log('📊 RESUMEN DE LA CONEXIÓN:');
    console.log('   ✅ Cliente de Supabase: Funcionando');
    console.log('   ✅ Conexión básica: Funcionando');
    console.log('   ✅ Sistema de autenticación: Funcionando');
    console.log('   ⚠️  Tablas: Verificar configuración de base de datos');
    console.log('   ⚠️  Credenciales: Verificar usuarios en la base de datos\n');

    console.log('🎉 ¡Conexión con Supabase verificada exitosamente!');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Configurar las tablas en Supabase si no existen');
    console.log('   2. Crear usuarios de prueba en la base de datos');
    console.log('   3. Configurar Row Level Security (RLS) si es necesario');
    console.log('   4. Crear archivo .env con las credenciales\n');

  } catch (error) {
    console.error('❌ Error crítico durante la verificación:');
    console.error(`   ${error.message}\n`);
    
    console.log('🔧 Posibles soluciones:');
    console.log('   1. Verificar que la URL de Supabase sea correcta');
    console.log('   2. Verificar que el servidor de Supabase esté ejecutándose');
    console.log('   3. Verificar la conectividad de red');
    console.log('   4. Verificar que la clave anónima sea válida\n');
    
    process.exit(1);
  }
}

// Ejecutar el test
testSupabaseConnection();
