import { useState, useEffect, useMemo } from 'react';
import { supabase, testSupabaseConnection } from '../services/supabase';

// Modo demo desactivado: siempre usar Supabase
// let DEMO_MODE = false; // Comentado para evitar warning de variable no usada

// Sin auto-modo demo: si hay errores, se mostrarán y se corrigen en servidor/policies

// Hook personalizado para manejo de autenticación
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar usuario actual al cargar (sin modo demo)
    const checkUser = async () => {
      try {
        // Verificar usuario actual
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.warn('Error checking user:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Verificar usuario inicial
    checkUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Función de login con reintentos para errores de red
  const signIn = async (email, password) => {
    setLoading(true);
    
    try {
      // Verificar conectividad primero
      console.log('🔍 Verificando conectividad con Supabase...');
      const connectionTest = await testSupabaseConnection();
      
      if (!connectionTest.success) {
        console.error('❌ Error de conectividad:', connectionTest.error);
        return { 
          success: false, 
          error: 'Error de conexión con el servidor. Verifica tu internet e inténtalo de nuevo.' 
        };
      }
      
      console.log('✅ Conectividad verificada, procediendo con login...');
      
      const maxRetries = 3;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Intento de login ${attempt}/${maxRetries}`);
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            // Si es error de credenciales, no reintentar
            if (error.message.includes('Invalid login credentials') || 
                error.message.includes('Email not confirmed')) {
              throw error;
            }
            // Para otros errores, reintentar
            throw error;
          }

          console.log('✅ Login exitoso');
          return { success: true, data };
          
        } catch (error) {
          lastError = error;
          console.error(`❌ Error en intento ${attempt}:`, error);
          
          // Si es el último intento o es error de credenciales, no reintentar
          if (attempt === maxRetries || 
              error.message.includes('Invalid login credentials') ||
              error.message.includes('Email not confirmed')) {
            break;
          }
          
          // Esperar antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      
      // Determinar el mensaje de error apropiado
      let errorMessage = 'Error de conexión. Inténtalo de nuevo.';
      
      if (lastError?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales incorrectas';
      } else if (lastError?.message?.includes('Email not confirmed')) {
        errorMessage = 'Email no confirmado. Revisa tu bandeja de entrada.';
      } else if (lastError?.message?.includes('Failed to fetch') || 
                 lastError?.message?.includes('ERR_NETWORK_CHANGED')) {
        errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const signUp = async (email, password, firstName, lastName) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'student'
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
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { 
        success: false, 
        error: error.message || 'Error al cerrar sesión' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Función de reset password
  const resetPassword = async (email) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error en reset password:', error);
      return { 
        success: false, 
        error: error.message || 'Error al enviar el email de restablecimiento' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Calcular roles usando useMemo para estabilidad
  const isAdmin = useMemo(() => {
    return user?.user_metadata?.role === 'admin';
  }, [user]);
  
  const isStudent = useMemo(() => {
    return user?.user_metadata?.role === 'student';
  }, [user]);

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isStudent,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
};
