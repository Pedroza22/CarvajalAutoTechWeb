// src/utils/errorHandler.js - Manejo de errores y limpieza de conflictos

// Función para limpiar errores de polyfill y extensiones
export const handlePolyfillErrors = () => {
  // Interceptar errores de polyfill
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Filtrar errores conocidos de extensiones
    if (message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('polyfill.js') ||
        message.includes('Extension context invalidated')) {
      // No mostrar estos errores en consola
      return;
    }
    
    // Mostrar otros errores normalmente
    originalConsoleError.apply(console, args);
  };

  // Interceptar errores no capturados
  window.addEventListener('error', (event) => {
    const message = event.error?.message || event.message || '';
    
    if (message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('polyfill.js') ||
        message.includes('Extension context invalidated')) {
      // Prevenir que estos errores se muestren
      event.preventDefault();
      return false;
    }
  });

  // Interceptar promesas rechazadas
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason?.toString() || '';
    
    if (message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist') ||
        message.includes('polyfill.js') ||
        message.includes('Extension context invalidated')) {
      // Prevenir que estos errores se muestren
      event.preventDefault();
      return false;
    }
  });
};

// Función para limpiar el localStorage de datos corruptos
export const cleanupLocalStorage = () => {
  try {
    // Limpiar datos que puedan causar conflictos
    const keysToRemove = [
      'supabase.auth.token',
      'supabase.auth.refresh_token',
      'supabase.auth.user',
      'sb-',
      'supabase-'
    ];

    Object.keys(localStorage).forEach(key => {
      if (keysToRemove.some(prefix => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });

    console.log('✅ LocalStorage limpiado');
  } catch (error) {
    console.warn('⚠️ Error limpiando localStorage:', error);
  }
};

// Función para verificar y limpiar el estado de Supabase
export const cleanupSupabaseState = async () => {
  try {
    // Comentado temporalmente para debug
    console.log('✅ Estado de Supabase limpiado (simulado)');
  } catch (error) {
    console.warn('⚠️ Error limpiando estado de Supabase:', error);
  }
};

// Función principal de inicialización
export const initializeErrorHandling = async () => {
  console.log('🔄 Inicializando manejo de errores...');
  
  // Limpiar errores de polyfill
  handlePolyfillErrors();
  
  // Limpiar localStorage
  cleanupLocalStorage();
  
  // Limpiar estado de Supabase
  await cleanupSupabaseState();
  
  console.log('✅ Manejo de errores inicializado');
};

// Función para mostrar errores de manera amigable
export const showUserFriendlyError = (error) => {
  const message = error?.message || error?.toString() || 'Error desconocido';
  
  // Mapear errores técnicos a mensajes amigables
  const friendlyMessages = {
    'Could not establish connection': 'Error de conexión. Por favor, recarga la página.',
    'Receiving end does not exist': 'Error de comunicación. Por favor, recarga la página.',
    'Network request failed': 'Error de red. Verifica tu conexión a internet.',
    'Failed to fetch': 'Error de conexión. Verifica tu conexión a internet.',
    'Invalid credentials': 'Credenciales incorrectas. Verifica tu email y contraseña.',
    'User not found': 'Usuario no encontrado. Verifica tu email.',
    'Email already registered': 'Este email ya está registrado.',
    'Password too weak': 'La contraseña es muy débil. Usa al menos 6 caracteres.'
  };

  for (const [technical, friendly] of Object.entries(friendlyMessages)) {
    if (message.includes(technical)) {
      return friendly;
    }
  }

  return message;
};

export default {
  handlePolyfillErrors,
  cleanupLocalStorage,
  cleanupSupabaseState,
  initializeErrorHandling,
  showUserFriendlyError
};
