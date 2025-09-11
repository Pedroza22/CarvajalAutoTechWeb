import { useState, useEffect } from 'react';

// Hook de debug sin Supabase
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Cambiado a false para debug
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función de login simulada
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular login exitoso
      const mockUser = {
        id: '1',
        email: email,
        user_metadata: {
          first_name: 'Usuario',
          last_name: 'Prueba',
          role: email.includes('admin') ? 'admin' : 'student'
        }
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true, data: { user: mockUser } };
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

  // Función de registro simulada
  const signUp = async (firstName, lastName, email, password) => {
    setLoading(true);
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular registro exitoso
      const mockUser = {
        id: '1',
        email: email,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: 'student'
        }
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true, data: { user: mockUser } };
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

  // Función de logout simulada
  const signOut = async () => {
    setLoading(true);
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

  // Calcular roles
  const isAdmin = user?.user_metadata?.role === 'admin';
  const isStudent = user?.user_metadata?.role === 'student';

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

