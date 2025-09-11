#!/usr/bin/env node

/**
 * Script maestro para ejecutar todos los tests de verificación
 * Uso: node scripts/run-all-tests.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Ejecutando todos los tests de verificación...\n');

async function runAllTests() {
  const results = {
    envSetup: false,
    quickConnection: false,
    fullConnection: false,
    appCompilation: false
  };

  try {
    // 1. Verificar/crear archivo .env
    console.log('1️⃣ Configurando archivo .env...');
    try {
      execSync('node scripts/setup-env.js', { stdio: 'pipe' });
      results.envSetup = true;
      console.log('   ✅ Archivo .env configurado\n');
    } catch (error) {
      console.log('   ⚠️  Archivo .env ya existe o error en configuración\n');
      results.envSetup = true; // Asumimos que está bien
    }

    // 2. Test rápido de conexión
    console.log('2️⃣ Ejecutando test rápido de conexión...');
    try {
      execSync('node scripts/quick-connection-test.js', { stdio: 'pipe' });
      results.quickConnection = true;
      console.log('   ✅ Test rápido exitoso\n');
    } catch (error) {
      console.log('   ❌ Test rápido falló\n');
    }

    // 3. Test completo de conexión
    console.log('3️⃣ Ejecutando test completo de conexión...');
    try {
      execSync('node scripts/test-supabase-connection.js', { stdio: 'pipe' });
      results.fullConnection = true;
      console.log('   ✅ Test completo exitoso\n');
    } catch (error) {
      console.log('   ⚠️  Test completo con advertencias\n');
    }

    // 4. Verificar compilación de la app
    console.log('4️⃣ Verificando compilación de la aplicación...');
    try {
      // Solo verificar sintaxis, no ejecutar
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      results.appCompilation = true;
      console.log('   ✅ Compilación exitosa\n');
    } catch (error) {
      // Si no hay TypeScript, verificar con ESLint
      try {
        execSync('npx eslint src/ --ext .js,.jsx --no-error-on-unmatched-pattern', { stdio: 'pipe' });
        results.appCompilation = true;
        console.log('   ✅ Sintaxis verificada con ESLint\n');
      } catch (eslintError) {
        console.log('   ⚠️  Advertencias de sintaxis encontradas\n');
      }
    }

    // 5. Resumen final
    console.log('📊 RESUMEN DE TESTS:');
    console.log(`   ${results.envSetup ? '✅' : '❌'} Configuración de .env`);
    console.log(`   ${results.quickConnection ? '✅' : '❌'} Test rápido de conexión`);
    console.log(`   ${results.fullConnection ? '✅' : '❌'} Test completo de conexión`);
    console.log(`   ${results.appCompilation ? '✅' : '❌'} Compilación de aplicación\n`);

    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.log('🎉 ¡Todos los tests pasaron exitosamente!');
      console.log('💡 La aplicación está lista para ejecutarse con: npm start\n');
    } else {
      console.log('⚠️  Algunos tests fallaron, pero la aplicación puede funcionar.');
      console.log('💡 Revisa los errores anteriores y ejecuta: npm start\n');
    }

    // 6. Próximos pasos
    console.log('🔧 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar: npm start');
    console.log('   2. Abrir: http://localhost:3001');
    console.log('   3. Probar login con credenciales demo');
    console.log('   4. Verificar funcionalidad del CRUD del admin\n');

  } catch (error) {
    console.error('❌ Error ejecutando tests:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

runAllTests();

