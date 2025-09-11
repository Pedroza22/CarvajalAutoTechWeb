import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';

// Modo demo desactivado: siempre usar Supabase
let DEMO_MODE = false;

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

  // Función de login
  const signIn = async (email, password) => {
    setLoading(true);
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
    signOut
  };
};
