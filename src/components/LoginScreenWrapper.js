import React from 'react';
import { getColor } from '../utils/constants';
import Logo from './Logo';

const LoginScreenWrapper = ({ children, showLogo = true, logoPosition = 'top', hideLogoForSelection = false }) => {
  const getLogoPosition = () => {
    switch (logoPosition) {
      case 'center':
        return {
          position: 'absolute',
          top: '7%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          textAlign: 'center'
        };
      case 'top':
      default:
        return {
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        };
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${getColor('dark')} 0%, ${getColor('darkSecondary')} 50%, ${getColor('dark')} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        color: getColor('textPrimary'),
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Logo */}
      {showLogo && !hideLogoForSelection && (
        <div style={getLogoPosition()}>
          <Logo 
            size={logoPosition === 'center' ? 'xlarge' : 'medium'} 
            showText={false} 
            style={{ transform: 'scale(1.2)' }}
          />
        </div>
      )}

      {/* Contenido */}
      <div style={{ 
        maxWidth: '460px', 
        width: '100%',
        marginTop: hideLogoForSelection ? '0px' : (logoPosition === 'center' ? '230px' : '120px'), // Sin margen si no hay logo
        boxSizing: 'border-box'
      }}>
        {children}
      </div>

      {/* Footer con políticas de privacidad */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: getColor('textSecondary'),
        zIndex: 10
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          © 2025 CarvajalAutoTech. Todos los derechos reservados.
        </p>
        <p style={{ margin: '0' }}>
          <a 
            href="/politicas-privacidad.html" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: getColor('primary'),
              textDecoration: 'none',
              borderBottom: `1px solid ${getColor('primary')}30`,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderBottomColor = getColor('primary');
              e.target.style.color = getColor('primary');
            }}
            onMouseLeave={(e) => {
              e.target.style.borderBottomColor = getColor('primary') + '30';
              e.target.style.color = getColor('primary');
            }}
          >
            Políticas de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginScreenWrapper;
