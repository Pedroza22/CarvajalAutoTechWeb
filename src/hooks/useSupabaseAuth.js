// src/hooks/useSupabaseAuth.js
import { useState, useEffect, useCallback } from 'react';
import SupabaseConfig from '../config/supabase';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Verificar estado de conexión
  const checkConnection = useCallback(async () => {
    try {
      const healthCheck = await SupabaseConfig.healthCheck();
      if (healthCheck.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
        console.warn('Supabase connection error:', healthCheck.error);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Supabase health check failed:', error);
    }
  }, []);

  // Obtener sesión actual
  const getCurrentSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await SupabaseConfig.client.auth.getSession();
      
      if (error) {
        console.warn('Error getting session:', error);
        return null;
      }
      
      return session;
    } catch (error) {
      console.warn('Error in getCurrentSession:', error);
      return null;
    }
  }, []);

  // Inicializar autenticación
  const initializeAuth = useCallback(async () => {
    setLoading(true);
    
    try {
      // Verificar conexión
      await checkConnection();
      
      // Obtener sesión actual
      const currentSession = await getCurrentSession();
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
      } else {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [checkConnection, getCurrentSession]);

  // Escuchar cambios de autenticación
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = SupabaseConfig.client.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user || null);
        setIsAuthenticated(!!session);
        setLoading(false);
      }
    );

    // Inicializar
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  // Función de login
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    
    try {
      const { data, error } = await SupabaseConfig.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de registro
  const signUp = useCallback(async (email, password, userData = {}) => {
    setLoading(true);
    
    try {
      const { data, error } = await SupabaseConfig.client.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de logout
  const signOut = useCallback(async () => {
    setLoading(true);
    
    try {
      const { error } = await SupabaseConfig.client.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si es admin
  const isAdmin = useCallback(() => {
    return user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin';
  }, [user]);

  // Verificar si es estudiante
  const isStudent = useCallback(() => {
    return user?.user_metadata?.role === 'student' || user?.app_metadata?.role === 'student';
  }, [user]);

  // Obtener perfil del usuario
  const getUserProfile = useCallback(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.first_name || user.user_metadata?.firstName,
      lastName: user.user_metadata?.last_name || user.user_metadata?.lastName,
      role: user.user_metadata?.role || user.app_metadata?.role || 'student',
      avatar: user.user_metadata?.avatar_url,
      createdAt: user.created_at
    };
  }, [user]);

  return {
    // Estado
    user,
    session,
    loading,
    isAuthenticated,
    connectionStatus,
    
    // Funciones de autenticación
    signIn,
    signUp,
    signOut,
    
    // Utilidades
    isAdmin,
    isStudent,
    getUserProfile,
    
    // Funciones de utilidad
    checkConnection,
    initializeAuth
  };
};

