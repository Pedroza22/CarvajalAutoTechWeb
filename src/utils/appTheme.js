// Tema web EXACTO de la app móvil Flutter
export const colors = {
  // Paleta de colores negro/rojo modernista - EXACTA del móvil
  primaryRed: '#DC2626',      // Color principal rojo
  darkRed: '#B91C1C',         // Rojo oscuro
  lightRed: '#EF4444',        // Rojo claro
  
  primaryBlack: '#1A1A1A',    // Negro principal
  darkBlack: '#0A0A0A',       // Negro muy oscuro
  lightBlack: '#2D2D2D',      // Negro claro/superficie
  
  greyDark: '#404040',        // Gris oscuro para bordes
  greyMedium: '#6B7280',      // Gris medio
  greyLight: '#9CA3AF',       // Gris claro
  
  white: '#FFFFFF',           // Blanco puro
  offWhite: '#F9FAFB',        // Blanco off
  
  // Colores de estado - EXACTOS del móvil
  success: '#10B981',         // Verde éxito
  warning: '#F59E0B',         // Amarillo advertencia
  error: '#EF4444',           // Rojo error
  info: '#3B82F6',            // Azul información
};

export const gradients = {
  // Gradientes personalizados - EXACTOS del móvil
  primary: 'linear-gradient(135deg, #DC2626, #B91C1C)',
  background: 'linear-gradient(180deg, #1A1A1A, #2D2D2D)',
  success: 'linear-gradient(135deg, #10B981, #059669)',
  warning: 'linear-gradient(135deg, #F59E0B, #D97706)',
  info: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  
  // Gradientes para cards
  cardGradient: 'linear-gradient(135deg, #1A1A1A, #2D2D2D)',
  cardHover: 'linear-gradient(135deg, #2D2D2D, #404040)',
};

export const shadows = {
  // Sombras personalizadas - EXACTAS del móvil
  primary: '0 4px 8px rgba(220, 38, 38, 0.3)',
  card: '0 6px 12px rgba(26, 26, 26, 0.3)',
  cardHover: '0 8px 16px rgba(26, 26, 26, 0.4)',
  button: '0 4px 8px rgba(220, 38, 38, 0.3)',
  buttonPressed: '0 2px 4px rgba(0, 0, 0, 0.2)',
  
  // Sombras para efectos de elevación
  elevation1: '0 2px 4px rgba(0, 0, 0, 0.1)',
  elevation2: '0 4px 8px rgba(0, 0, 0, 0.15)',
  elevation3: '0 8px 16px rgba(0, 0, 0, 0.2)',
  elevation4: '0 12px 24px rgba(0, 0, 0, 0.25)',
};

export const borderRadius = {
  small: '8px',
  medium: '12px',
  large: '16px',
  xlarge: '20px',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const typography = {
  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Tema completo para compatibilidad
export const AppTheme = {
  ...colors,
  gradients,
  shadows,
  borderRadius,
  spacing,
  typography,
  
  // Métodos de utilidad
  card(bgOpacity = 1) {
    return {
      background: `rgba(45, 45, 45, ${bgOpacity})`,
      border: '1px solid rgba(64, 64, 64, 0.3)',
      borderRadius: borderRadius.large,
      boxShadow: shadows.card,
    };
  },
  
  button(primary = true) {
    return {
      background: primary ? gradients.primary : 'transparent',
      border: primary ? 'none' : `2px solid ${colors.primaryRed}`,
      borderRadius: borderRadius.medium,
      boxShadow: primary ? shadows.button : 'none',
      color: colors.white,
    };
  },
};