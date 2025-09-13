// Configuración de entorno para Carvajal AutoTech
export const config = {
  // Supabase
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || 'https://supabase.carvajalautotech.com',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzI1ODk2MDAwLCJleHAiOjIwNDExMjgwMDB9.kA_F1gSwDb_8foKy0vcttWvHJ8wn0HRnRmW31nXJNKQ'
  },
  
  // Aplicación
  app: {
    name: process.env.REACT_APP_APP_NAME || 'Carvajal AutoTech',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Configuración de red
  network: {
    maxRetries: 3,
    retryDelay: 1000, // ms
    connectionCheckInterval: 30000, // 30 segundos
    timeout: 10000 // 10 segundos
  },
  
  // Configuración de autenticación
  auth: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    refreshThreshold: 5 * 60 * 1000 // 5 minutos antes del vencimiento
  }
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = () => config.app.environment === 'development';

// Función para verificar si estamos en producción
export const isProduction = () => config.app.environment === 'production';

// Función para obtener la URL base de la API
export const getApiBaseUrl = () => config.supabase.url;

// Función para obtener la clave anónima
export const getAnonKey = () => config.supabase.anonKey;

// Función para logging condicional (solo en desarrollo)
export const debugLog = (...args) => {
  if (isDevelopment()) {
    console.log('[DEBUG]', ...args);
  }
};

// Función para logging de errores
export const errorLog = (...args) => {
  console.error('[ERROR]', ...args);
};

// Función para logging de información
export const infoLog = (...args) => {
  console.info('[INFO]', ...args);
};
