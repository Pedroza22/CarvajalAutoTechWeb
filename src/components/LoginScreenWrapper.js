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

    </div>
  );
};

export default LoginScreenWrapper;
