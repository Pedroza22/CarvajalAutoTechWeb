// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

class SupabaseConfig {
  static get url() {
    return process.env.REACT_APP_SUPABASE_URL || 'https://supabase.carvajalautotech.com';
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
          persistSession: true,
          autoRefreshToken: true,
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

  static get client() {
    if (!this._client) {
      this._client = this.initialize();
    }
    return this._client;
  }

  static async testConnection() {
    try {
      const { data, error } = await this.client.auth.getSession();
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
      console.log('🔄 Probando conexión con Supabase...');
      
      // Test básico - obtener información del usuario actual (será null si no está autenticado)
      const { data: sessionData } = await this.client.auth.getSession();
      const hasSession = !!sessionData?.session;
      console.log('👤 Usuario actual:', sessionData.session?.user?.email || 'No autenticado');

      // Si no hay sesión, evitamos consultar tablas potencialmente protegidas para no provocar 401
      if (!hasSession) {
        console.log('⏭️ Sin sesión: se omiten consultas a tablas protegidas');
        return {
          success: true,
          isConnectionEstablished: true,
          hasSession: false,
          skippedTableChecks: true,
          message: 'Sin sesión: chequeo básico OK, consultas a tablas omitidas'
        };
      }

      // Con sesión: realizar consulta simple a una tabla protegida
      const { data, error } = await this.client
        .from('user_profiles')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.error('⚠️ Conexión establecida pero error en consulta:', error);
        console.log('💡 Esto puede indicar RLS/policies o tabla ausente');
        return {
          success: false,
          error: error.message,
          isConnectionEstablished: true,
          hasSession: true
        };
      }
      
      console.log('✅ Conexión con base de datos exitosa');
      console.log('📊 Respuesta:', data);
      console.log('🎉 Test de conexión completado');
      
      return {
        success: true,
        data: data,
        isConnectionEstablished: true,
        hasSession: true
      };
    } catch (error) {
      console.error('❌ Supabase Health Check Exception:', error);
      return {
        success: false,
        error: error.message,
        isConnectionEstablished: false
      };
    }
  }
}

// Inicializar el cliente
SupabaseConfig._client = null;

export default SupabaseConfig;
