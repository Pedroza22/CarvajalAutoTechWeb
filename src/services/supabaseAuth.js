// src/services/supabaseAuth.js
import SupabaseConfig from '../config/supabase';

// Usar el cliente configurado
const supabase = SupabaseConfig.client;

export const supabaseAuth = {
  async signIn(email, password) {
    try {
      // Verificar si Supabase está disponible
      const healthCheck = await SupabaseConfig.healthCheck();
      if (!healthCheck.success) {
        console.warn('Supabase no disponible, usando modo demo');
        return this.demoSignIn(email, password);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.warn('Error en Supabase signin, usando modo demo:', error.message);
        return this.demoSignIn(email, password);
      }

      return { success: true, data: { user: data.user } };
    } catch (error) {
      console.warn('Error en signin, usando modo demo:', error.message);
      return this.demoSignIn(email, password);
    }
  },

  async signUpStudent(firstName, lastName, email, password) {
    try {
      // Verificar si Supabase está disponible
      const healthCheck = await SupabaseConfig.healthCheck();
      if (!healthCheck.success) {
        console.warn('Supabase no disponible, usando modo demo');
        return this.demoSignUp(firstName, lastName, email, password);
      }

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

      if (error) {
        console.warn('Error en Supabase signup, usando modo demo:', error.message);
        return this.demoSignUp(firstName, lastName, email, password);
      }

      return { success: true, data: { user: data.user } };
    } catch (error) {
      console.warn('Error en signup, usando modo demo:', error.message);
      return this.demoSignUp(firstName, lastName, email, password);
    }
  },

  async signOut() {

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  },

  getCurrentUser() {
    try {
      // Para obtener el usuario actual de forma síncrona, usamos getSession
      const sessionData = supabase.auth.getSession();
      if (!sessionData || !sessionData.data) {
        return null;
      }
      return sessionData.data.session?.user || null;
    } catch (error) {
      console.warn('Error getting current user, falling back to demo mode:', error);
      // Fallback a modo demo si hay problemas con Supabase
      return this.demoGetCurrentUser();
    }
  },

  isAuthenticated() {
    const user = this.getCurrentUser();
    if (user) {
      return true;
    }
    // Fallback a modo demo
    return this.demoIsAuthenticated();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    if (user && user.user_metadata?.role === 'admin') {
      return true;
    }
    // Fallback a modo demo
    return this.demoIsAdmin();
  },

  isStudent() {
    const user = this.getCurrentUser();
    if (user && user.user_metadata?.role === 'student') {
      return true;
    }
    // Fallback a modo demo
    return this.demoIsStudent();
  },

  // Demo mode fallbacks
  demoSignIn(email, password) {
    const users = [
      { id: '1', email: 'estudiante@test.com', password: '12345678', role: 'student', firstName: 'Estudiante', lastName: 'Demo' },
      { id: '2', email: 'admin@test.com', password: 'admin123', role: 'admin', firstName: 'Admin', lastName: 'Demo' },
    ];

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const currentUser = { ...user, user_metadata: { role: user.role } };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return { success: true, data: { user: currentUser } };
    }
    return { success: false, error: 'Credenciales inválidas' };
  },

  demoSignUp(firstName, lastName, email, password) {
    const users = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'El correo ya está registrado' };
    }
    
    const newUser = {
      id: String(Date.now()),
      email,
      password,
      role: 'student',
      firstName,
      lastName,
      user_metadata: { role: 'student' }
    };
    
    users.push(newUser);
    localStorage.setItem('demoUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, data: { user: newUser } };
  },

  demoSignOut() {
    localStorage.removeItem('currentUser');
    return { success: true };
  },

  demoGetCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  },

  demoIsAuthenticated() {
    return !!this.demoGetCurrentUser();
  },

  demoIsAdmin() {
    const user = this.demoGetCurrentUser();
    return user && user.role === 'admin';
  },

  demoIsStudent() {
    const user = this.demoGetCurrentUser();
    return user && user.role === 'student';
  }
};
