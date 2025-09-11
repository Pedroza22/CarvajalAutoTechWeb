#!/usr/bin/env node

/**
 * Script para diagnosticar errores JWT de Supabase
 * Uso: node scripts/diagnose-jwt-error.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://72.60.53.240:8000/';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ';

console.log('🔍 Diagnosticando error JWT de Supabase...\n');

// Función para decodificar JWT (solo el payload, sin verificar firma)
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT inválido: debe tener 3 partes');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (error) {
    return { error: error.message };
  }
}

async function diagnoseJWTError() {
  console.log('📋 Información del JWT:');
  
  // Decodificar el JWT
  const payload = decodeJWT(supabaseAnonKey);
  
  if (payload.error) {
    console.log(`   ❌ Error decodificando JWT: ${payload.error}\n`);
    return;
  }
  
  console.log(`   🔑 Algoritmo: ${payload.alg || 'No especificado'}`);
  console.log(`   🏢 Emisor: ${payload.iss || 'No especificado'}`);
  console.log(`   👤 Rol: ${payload.role || 'No especificado'}`);
  console.log(`   📅 Emitido: ${payload.iat ? new Date(payload.iat * 1000).toISOString() : 'No especificado'}`);
  console.log(`   ⏰ Expira: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No especificado'}`);
  
  // Verificar si el token ha expirado
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    console.log(`   ⚠️  Token expirado hace ${now - payload.exp} segundos\n`);
  } else if (payload.exp) {
    console.log(`   ✅ Token válido por ${payload.exp - now} segundos más\n`);
  }
  
  console.log('🔧 Diagnóstico de conectividad:');
  
  try {
    // Test básico de conectividad HTTP
    const https = require('https');
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = new url.URL(supabaseUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    console.log(`   🌐 Probando conectividad HTTP a ${supabaseUrl}...`);
    
    const request = client.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (response) => {
      console.log(`   ✅ Respuesta HTTP: ${response.statusCode} ${response.statusMessage}`);
      console.log(`   📋 Headers: ${JSON.stringify(response.headers, null, 2)}`);
    });
    
    request.on('error', (error) => {
      console.log(`   ❌ Error de conectividad: ${error.message}`);
    });
    
    request.on('timeout', () => {
      console.log(`   ⏰ Timeout de conexión`);
      request.destroy();
    });
    
    request.end();
    
  } catch (error) {
    console.log(`   ❌ Error en test de conectividad: ${error.message}`);
  }
  
  console.log('\n💡 Posibles soluciones:');
  console.log('   1. Verificar que la URL de Supabase sea correcta');
  console.log('   2. Verificar que el servidor de Supabase esté ejecutándose');
  console.log('   3. Verificar que la clave anónima sea válida');
  console.log('   4. Verificar la configuración de JWT en Supabase');
  console.log('   5. Verificar la sincronización de tiempo del sistema');
  console.log('   6. Probar con un token JWT diferente\n');
  
  console.log('🔧 Comandos de verificación:');
  console.log('   # Verificar conectividad de red');
  console.log(`   ping ${new URL(supabaseUrl).hostname}`);
  console.log('   # Verificar si el puerto está abierto');
  console.log(`   telnet ${new URL(supabaseUrl).hostname} ${new URL(supabaseUrl).port || 80}`);
  console.log('   # Verificar con curl');
  console.log(`   curl -I ${supabaseUrl}\n`);
}

diagnoseJWTError();

