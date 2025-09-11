#!/usr/bin/env node

/**
 * Script maestro para verificar toda la configuración
 * Uso: node scripts/verify-all.js
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Verificación completa del sistema Carvajal AutoTech\n');

async function verifyAll() {
  const results = {
    envSetup: false,
    newConfig: false,
    quickConnection: false,
    fullConnection: false,
    appFiles: false
  };

  try {
    // 1. Verificar archivo .env
    console.log('1️⃣ Verificando archivo .env...');
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      if (envContent.includes('REACT_APP_SUPABASE_URL') && envContent.includes('REACT_APP_SUPABASE_ANON_KEY')) {
        results.envSetup = true;
        console.log('   ✅ Archivo .env configurado correctamente\n');
      } else {
        console.log('   ⚠️  Archivo .env existe pero falta configuración\n');
      }
    } else {
      console.log('   ❌ Archivo .env no encontrado\n');
    }

    // 2. Test de nueva configuración
    console.log('2️⃣ Probando nueva configuración de Supabase...');
    try {
      execSync('node scripts/test-new-config.js', { stdio: 'pipe' });
      results.newConfig = true;
      console.log('   ✅ Nueva configuración funcionando\n');
    } catch (error) {
      console.log('   ⚠️  Nueva configuración con advertencias\n');
    }

    // 3. Test rápido de conexión
    console.log('3️⃣ Ejecutando test rápido de conexión...');
    try {
      execSync('node scripts/quick-connection-test.js', { stdio: 'pipe' });
      results.quickConnection = true;
      console.log('   ✅ Test rápido exitoso\n');
    } catch (error) {
      console.log('   ❌ Test rápido falló\n');
    }

    // 4. Test completo de conexión
    console.log('4️⃣ Ejecutando test completo de conexión...');
    try {
      execSync('node scripts/test-supabase-connection.js', { stdio: 'pipe' });
      results.fullConnection = true;
      console.log('   ✅ Test completo exitoso\n');
    } catch (error) {
      console.log('   ⚠️  Test completo con advertencias\n');
    }

    // 5. Verificar archivos de la aplicación
    console.log('5️⃣ Verificando archivos de la aplicación...');
    const requiredFiles = [
      'src/config/supabase.js',
      'src/hooks/useSupabaseAuth.js',
      'src/components/SupabaseStatus.js',
      'src/services/supabaseAuth.js',
      'src/App.js'
    ];

    let allFilesExist = true;
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} - FALTANTE`);
        allFilesExist = false;
      }
    }
    results.appFiles = allFilesExist;
    console.log('');

    // 6. Resumen final
    console.log('📊 RESUMEN DE VERIFICACIÓN:');
    console.log(`   ${results.envSetup ? '✅' : '❌'} Archivo .env configurado`);
    console.log(`   ${results.newConfig ? '✅' : '⚠️'} Nueva configuración de Supabase`);
    console.log(`   ${results.quickConnection ? '✅' : '❌'} Test rápido de conexión`);
    console.log(`   ${results.fullConnection ? '✅' : '⚠️'} Test completo de conexión`);
    console.log(`   ${results.appFiles ? '✅' : '❌'} Archivos de aplicación\n`);

    const criticalPassed = results.envSetup && results.appFiles;
    const connectionWorking = results.quickConnection || results.newConfig;
    
    if (criticalPassed && connectionWorking) {
      console.log('🎉 ¡Sistema listo para ejecutarse!');
      console.log('💡 La aplicación puede funcionar en modo demo o con Supabase\n');
    } else if (criticalPassed) {
      console.log('⚠️  Sistema configurado pero con problemas de conexión');
      console.log('💡 La aplicación funcionará en modo demo\n');
    } else {
      console.log('❌ Sistema necesita configuración adicional');
      console.log('💡 Ejecuta: node scripts/setup-env.js\n');
    }

    // 7. Próximos pasos
    console.log('🔧 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar: npm start');
    console.log('   2. Abrir: http://localhost:3001');
    console.log('   3. Probar login con credenciales demo:');
    console.log('      - Admin: admin@test.com / admin123');
    console.log('      - Estudiante: student@test.com / student123');
    console.log('   4. Verificar funcionalidad del CRUD del admin\n');

    // 8. Comandos útiles
    console.log('🛠️  COMANDOS ÚTILES:');
    console.log('   # Verificar conexión rápida');
    console.log('   node scripts/quick-connection-test.js');
    console.log('   # Diagnóstico completo');
    console.log('   node scripts/test-supabase-connection.js');
    console.log('   # Configurar .env');
    console.log('   node scripts/setup-env.js');
    console.log('   # Reiniciar servidor');
    console.log('   npm start\n');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    process.exit(1);
  }
}

verifyAll();

