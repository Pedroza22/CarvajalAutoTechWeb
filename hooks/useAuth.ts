// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { AuthService, User } from '../services/AuthService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticación inicial
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        const authenticated = await AuthService.isAuthenticated();
        
        setUser(currentUser);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = AuthService.onAuthStateChange(async (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, expectedRole: 'student' | 'admin', rememberMe?: boolean) => {
    setLoading(true);
    try {
      const result = await AuthService.signInWithEmailPassword({
        email,
        password,
        expectedRole,
        rememberMe,
      });

      if (result.isSuccess && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      }

      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setLoading(true);
    try {
      const result = await AuthService.signUpStudent({
        email,
        password,
        firstName,
        lastName,
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
};
