// Constantes de la aplicación (como AppConstants en Flutter)
const constants = {
  minPasswordLength: 4,
  appName: 'Carvajal AutoTech',
  version: '1.0.0',
  emailRegex: /^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/,
  nameMinLength: 2,
  
  // Colores del tema
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    secondary: '#ef4444',
    secondaryDark: '#dc2626',
    success: '#10b981',
    successDark: '#059669',
    warning: '#f59e0b',
    dark: '#0f0f0f',
    darkSecondary: '#1a1a1a',
    cardBg: '#1f2937',
    inputBg: '#374151',
    textPrimary: '#ffffff',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    border: '#4b5563'
  },

  // Mensajes de validación
  validationMessages: {
    emailRequired: 'Ingresa tu correo electrónico',
    emailInvalid: 'Ingresa un correo válido',
    passwordRequired: 'Ingresa una contraseña',
    passwordTooShort: `La contraseña debe tener al menos ${4} caracteres`,
    nameRequired: 'Ingresa tu nombre',
    nameTooShort: 'Nombre muy corto',
    lastNameRequired: 'Ingresa tu apellido',
    lastNameTooShort: 'Apellido muy corto',
    passwordsNoMatch: 'Las contraseñas no coinciden',
    termsRequired: 'Debes aceptar los términos y condiciones'
  }
};

// Export con verificación de seguridad
export const AppConstants = constants;

// Función de seguridad para obtener colores
export const getColor = (colorName, fallback = '#4b5563') => {
  return constants.colors[colorName] || fallback;
};
