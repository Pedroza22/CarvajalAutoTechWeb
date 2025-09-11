#!/usr/bin/env node

/**
 * Script para configurar el archivo .env automáticamente
 * Uso: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando archivo .env...\n');

const envContent = `# Supabase Configuration
REACT_APP_SUPABASE_URL=http://72.60.53.240:8000/
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ

# App Configuration
REACT_APP_APP_NAME=Carvajal AutoTech
REACT_APP_VERSION=1.0.0

# Development
GENERATE_SOURCEMAP=false
`;

const envPath = path.join(process.cwd(), '.env');

try {
  // Verificar si el archivo .env ya existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo .env ya existe.');
    console.log('¿Deseas sobrescribirlo? (y/N)');
    
    // En un entorno interactivo, podrías usar readline
    // Por ahora, vamos a crear un backup
    const backupPath = path.join(process.cwd(), '.env.backup');
    fs.copyFileSync(envPath, backupPath);
    console.log(`📁 Backup creado: ${backupPath}`);
  }

  // Crear el archivo .env
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado exitosamente!');
  console.log(`📍 Ubicación: ${envPath}\n`);

  console.log('📋 Contenido del archivo .env:');
  console.log('   REACT_APP_SUPABASE_URL=http://72.60.53.240:8000/');
  console.log('   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.log('   REACT_APP_APP_NAME=Carvajal AutoTech');
  console.log('   REACT_APP_VERSION=1.0.0');
  console.log('   GENERATE_SOURCEMAP=false\n');

  console.log('🎉 ¡Configuración completada!');
  console.log('💡 Ahora puedes ejecutar: npm start\n');

} catch (error) {
  console.error('❌ Error creando el archivo .env:');
  console.error(`   ${error.message}\n`);
  
  console.log('🔧 Solución manual:');
  console.log('   1. Crea un archivo llamado ".env" en la raíz del proyecto');
  console.log('   2. Copia el contenido del archivo "env.example"');
  console.log('   3. Asegúrate de que las credenciales de Supabase sean correctas\n');
  
  process.exit(1);
}

