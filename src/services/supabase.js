import { createClient } from '@supabase/supabase-js';
import { config, debugLog, errorLog } from '../config/environment';

// Configuración de Supabase usando la configuración centralizada
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;

debugLog('Supabase URL:', supabaseUrl);
debugLog('Supabase Key (primeros 20 chars):', supabaseKey.substring(0, 20) + '...');

// Crear cliente con configuración mejorada y manejo de errores de red
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'carvajal-autotech-web'
    }
  }
});

// Función para verificar la conexión
export const testSupabaseConnection = async () => {
  try {
    debugLog('🔄 Probando conexión con Supabase...');
    debugLog('📍 URL:', supabaseUrl);
    debugLog('🔑 Key:', supabaseKey.substring(0, 20) + '...');
    
    // Test básico de conectividad - usar una tabla que existe
    const { data, error } = await supabase
      .from('usuarios')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      errorLog('⚠️ Error en consulta de prueba:', error.message);
      return { success: false, error: error.message };
    }
    
    debugLog('✅ Conexión con Supabase exitosa');
    return { success: true, data };
  } catch (error) {
    errorLog('❌ Error de conexión:', error);
    return { success: false, error: error.message };
  }
};

// Tipos de usuario
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin'
};

// Funciones de autenticación
export const authService = {
  // Registro de estudiante
  async signUpStudent(userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: USER_ROLES.STUDENT
          }
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.message || 'Error al crear la cuenta' 
      };
    }
  },

  // Login (estudiante y admin)
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.message || 'Credenciales incorrectas' 
      };
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { 
        success: false, 
        error: error.message || 'Error al cerrar sesión' 
      };
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  },

  // Escuchar cambios de autenticación
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Verificar si el usuario es admin
  isAdmin(user) {
    return user?.user_metadata?.role === USER_ROLES.ADMIN;
  },

  // Verificar si el usuario es estudiante
  isStudent(user) {
    return user?.user_metadata?.role === USER_ROLES.STUDENT;
  }
};
