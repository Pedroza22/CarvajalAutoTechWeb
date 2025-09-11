// Servicio de autenticación demo (sin Supabase)
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin'
};

// Base de datos simulada en memoria
let currentUser = null;
const demoUsers = [
  {
    id: '1',
    email: 'estudiante@test.com',
    password: '12345678',
    user_metadata: {
      first_name: 'Juan',
      last_name: 'Pérez',
      role: USER_ROLES.STUDENT
    }
  },
  {
    id: '2',
    email: 'admin@test.com',
    password: 'admin123',
    user_metadata: {
      first_name: 'Admin',
      last_name: 'Sistema',
      role: USER_ROLES.ADMIN
    }
  }
];

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Registro de estudiante
  async signUpStudent(userData) {
    try {
      await delay(1500); // Simular delay de red

      // Verificar si el email ya existe
      const existingUser = demoUsers.find(user => user.email === userData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'Ya existe una cuenta con este correo electrónico'
        };
      }

      // Crear nuevo usuario
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        password: userData.password,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: USER_ROLES.STUDENT
        }
      };

      demoUsers.push(newUser);

      return { 
        success: true, 
        data: { user: newUser },
        message: 'Cuenta creada exitosamente'
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: 'Error al crear la cuenta' 
      };
    }
  },

  // Login (estudiante y admin)
  async signIn(email, password) {
    try {
      await delay(1000); // Simular delay de red

      const user = demoUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return {
          success: false,
          error: 'Credenciales incorrectas'
        };
      }

      currentUser = user;
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('demo_user', JSON.stringify(user));

      return { 
        success: true, 
        data: { user },
        message: 'Sesión iniciada correctamente'
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: 'Error al iniciar sesión' 
      };
    }
  },

  // Logout
  async signOut() {
    try {
      await delay(500);
      currentUser = null;
      localStorage.removeItem('demo_user');
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { 
        success: false, 
        error: 'Error al cerrar sesión' 
      };
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      // Intentar recuperar de localStorage
      const savedUser = localStorage.getItem('demo_user');
      if (savedUser) {
        currentUser = JSON.parse(savedUser);
      }
      return currentUser;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  },

  // Escuchar cambios de autenticación (simulado)
  onAuthStateChange(callback) {
    // En una implementación real, esto se llamaría cuando cambie el estado
    // Para el demo, simplemente devolvemos una función de limpieza
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
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

