import React, { useState } from 'react';
import { AppTheme } from '../utils/appTheme';

const CustomButton = React.memo(({
  text,
  onClick,
  isLoading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  disabled = false,
  icon,
  style = {}
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled || isLoading;

  const handleMouseDown = () => {
    if (!isDisabled) setIsPressed(true);
  };

  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  // Configuración de variantes - EXACTAS del móvil
  const variants = {
    primary: {
      background: AppTheme.gradients.primary,
      color: AppTheme.white,
      border: 'none',
      boxShadow: AppTheme.shadows.button,
    },
    secondary: {
      background: 'transparent',
      color: AppTheme.primaryRed,
      border: `2px solid ${AppTheme.primaryRed}`,
      boxShadow: 'none',
    },
    success: {
      background: AppTheme.gradients.success,
      color: AppTheme.white,
      border: 'none',
      boxShadow: `0 4px 8px ${AppTheme.success}33`,
    },
    outline: {
      background: 'transparent',
      color: AppTheme.white,
      border: `2px solid ${AppTheme.greyDark}`,
      boxShadow: 'none',
    }
  };

  // Configuración de tamaños - EXACTOS del móvil
  const sizes = {
    small: {
      padding: '8px 16px',
      fontSize: '14px',
      minHeight: '40px',
      borderRadius: AppTheme.borderRadius.medium,
    },
    medium: {
      padding: '12px 24px',
      fontSize: '16px',
      minHeight: '48px',
      borderRadius: AppTheme.borderRadius.medium,
    },
    large: {
      padding: '16px 32px',
      fontSize: '18px',
      minHeight: '56px',
      borderRadius: AppTheme.borderRadius.medium,
    }
  };

  const baseStyle = {
    width: fullWidth ? '100%' : 'auto',
    fontWeight: '600',
    fontFamily: AppTheme.typography.fontFamily,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 0.15s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    transform: isPressed ? 'scale(0.96)' : 'scale(1)',
    letterSpacing: '0.5px',
    ...(variants[variant] || {}),
    ...(sizes[size] || {}),
    ...style
  };

  // Efecto de brillo sutil
  const shineEffectStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '40%',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
  };

  // Overlay cuando está presionado
  const pressedOverlayStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: variant === 'primary' || variant === 'success' 
      ? 'rgba(0, 0, 0, 0.1)' 
      : 'rgba(220, 38, 38, 0.1)',
    pointerEvents: 'none',
  };

  // Animación de loading
  const LoadingSpinner = () => (
    <div
      style={{
        width: '20px',
        height: '20px',
        border: '2px solid transparent',
        borderTop: `2px solid ${variant === 'primary' || variant === 'success' ? AppTheme.white : AppTheme.primaryRed}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={baseStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Efecto de brillo */}
      {!isDisabled && (variant === 'primary' || variant === 'success') && (
        <div style={shineEffectStyle} />
      )}
      
      {/* Contenido del botón */}
      {isLoading && <LoadingSpinner />}
      {icon && !isLoading && (
        <span style={{ fontSize: '20px' }}>{icon}</span>
      )}
      <span>{isLoading ? 'Cargando...' : text}</span>
      
      {/* Overlay cuando está presionado */}
      {isPressed && !isDisabled && (
        <div style={pressedOverlayStyle} />
      )}
    </button>
  );
});

export default CustomButton;