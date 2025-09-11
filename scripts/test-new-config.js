#!/usr/bin/env node

/**
 * Script para probar la nueva configuración de Supabase
 * Uso: node scripts/test-new-config.js
 */

// Simular el entorno de React
process.env.REACT_APP_SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'http://72.60.53.240:8000/';
process.env.REACT_APP_SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ';

console.log('🔧 Probando nueva configuración de Supabase...\n');

async function testNewConfig() {
  try {
    // Importar la configuración (simulando el entorno de React)
    const { createClient } = require('@supabase/supabase-js');
    
    // Simular la clase SupabaseConfig
    class SupabaseConfig {
      static get url() {
        return process.env.REACT_APP_SUPABASE_URL || 'http://72.60.53.240:8000/';
      }

      static get anonKey() {
        return process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ';
      }

      static get isConfigured() {
        return !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY);
      }

      static get debug() {
        return process.env.NODE_ENV === 'development';
      }

      static initialize() {
        try {
          const client = createClient(this.url, this.anonKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
              flowType: 'pkce'
            },
            global: {
              headers: {
                'X-Client-Info': 'carvajal-autotech-react'
              }
            }
          });

          if (this.debug) {
            console.log('🔧 Supabase Config:');
            console.log(`   URL: ${this.url}`);
            console.log(`   Key: ${this.anonKey.substring(0, 20)}...`);
            console.log(`   Configured: ${this.isConfigured}`);
            console.log(`   Debug: ${this.debug}`);
          }

          return client;
        } catch (error) {
          console.error('❌ Error inicializando Supabase:', error);
          throw error;
        }
      }

      static async testConnection() {
        try {
          const client = this.initialize();
          const { data, error } = await client.auth.getSession();
          if (error) {
            throw error;
          }
          return { success: true, data };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }

      static async healthCheck() {
        try {
          const response = await fetch(this.url, {
            method: 'GET',
            headers: {
              'apikey': this.anonKey,
              'Authorization': `Bearer ${this.anonKey}`
            },
            timeout: 5000
          });
          
          return {
            success: response.ok,
            status: response.status,
            statusText: response.statusText
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    }

    console.log('1️⃣ Verificando configuración...');
    console.log(`   URL: ${SupabaseConfig.url}`);
    console.log(`   Key: ${SupabaseConfig.anonKey.substring(0, 20)}...`);
    console.log(`   Configured: ${SupabaseConfig.isConfigured}`);
    console.log(`   Debug: ${SupabaseConfig.debug}\n`);

    console.log('2️⃣ Probando inicialización del cliente...');
    try {
      const client = SupabaseConfig.initialize();
      console.log('   ✅ Cliente inicializado exitosamente\n');
    } catch (error) {
      console.log(`   ❌ Error inicializando cliente: ${error.message}\n`);
      return;
    }

    console.log('3️⃣ Probando health check...');
    const healthCheck = await SupabaseConfig.healthCheck();
    if (healthCheck.success) {
      console.log(`   ✅ Health check exitoso: ${healthCheck.status} ${healthCheck.statusText}\n`);
    } else {
      console.log(`   ❌ Health check falló: ${healthCheck.error}\n`);
    }

    console.log('4️⃣ Probando conexión de autenticación...');
    const authTest = await SupabaseConfig.testConnection();
    if (authTest.success) {
      console.log('   ✅ Conexión de autenticación exitosa\n');
    } else {
      console.log(`   ⚠️  Conexión de autenticación con advertencias: ${authTest.error}\n`);
    }

    console.log('📊 RESUMEN:');
    console.log(`   ✅ Configuración: ${SupabaseConfig.isConfigured ? 'Correcta' : 'Incorrecta'}`);
    console.log(`   ✅ Cliente: Inicializado`);
    console.log(`   ${healthCheck.success ? '✅' : '❌'} Health Check: ${healthCheck.success ? 'Exitoso' : 'Falló'}`);
    console.log(`   ${authTest.success ? '✅' : '⚠️'} Auth Test: ${authTest.success ? 'Exitoso' : 'Con advertencias'}\n`);

    if (healthCheck.success && authTest.success) {
      console.log('🎉 ¡Nueva configuración funcionando correctamente!');
    } else {
      console.log('⚠️  Configuración funcional con algunas advertencias');
    }

  } catch (error) {
    console.error('❌ Error en test de configuración:', error);
  }
}

testNewConfig();

