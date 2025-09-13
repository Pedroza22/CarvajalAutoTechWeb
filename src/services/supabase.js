import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase con credenciales directas
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://supabase.carvajalautotech.com';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ';

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
    // Test básico de conectividad - usar una tabla que existe
    const { data, error } = await supabase
      .from('usuarios')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
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
