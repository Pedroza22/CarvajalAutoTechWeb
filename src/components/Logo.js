import React from 'react';
import { AppConstants } from '../utils/constants';

const Logo = ({ size = 'medium', showText = true, style = {} }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '60px', height: '60px' };
      case 'large':
        return { width: '120px', height: '120px' };
      case 'xlarge':
        return { width: '180px', height: '180px' };
      default:
        return { width: '100px', height: '100px' };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: '14px', fontWeight: '600' };
      case 'large':
        return { fontSize: '24px', fontWeight: '700' };
      case 'xlarge':
        return { fontSize: '32px', fontWeight: '800' };
      default:
        return { fontSize: '18px', fontWeight: '600' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      ...style
    }}>
      {/* Logo de Carvajal AutoTech */}
      <div style={{
        ...getSizeStyles(),
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <img 
          src="/logo.png" 
          alt="Carvajal AutoTech Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
          onError={(e) => {
            // Fallback si la imagen no se carga
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback si no se carga la imagen */}
        <div style={{
          display: 'none',
          width: '100%',
          height: '100%',
          background: AppConstants.colors.primary,
          borderRadius: '8px',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: size === 'small' ? '12px' : size === 'large' ? '24px' : size === 'xlarge' ? '36px' : '18px',
          fontWeight: 'bold'
        }}>
          CA
        </div>
      </div>

      {/* Text - Solo mostrar si se solicita explícitamente */}
      {showText && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          <div style={{
            ...getTextSize(),
            color: AppConstants.colors.textPrimary,
            lineHeight: 1.2
          }}>
            Carvajal AutoTech
          </div>
          <div style={{
            fontSize: size === 'small' ? '10px' : size === 'large' ? '14px' : '12px',
            color: AppConstants.colors.textSecondary,
            fontWeight: '400'
          }}>
            Sistema de Cuestionarios
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
