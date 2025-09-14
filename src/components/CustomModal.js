import React from 'react';
import { getColor } from '../utils/constants';

const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  buttons = [],
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  // Configuración por tipo de modal
  const modalConfig = {
    success: {
      icon: '✅',
      iconBg: '#10b981',
      iconColor: '#ffffff',
      titleColor: safeColor('success'),
      borderColor: safeColor('success') + '40'
    },
    error: {
      icon: '❌',
      iconBg: '#ef4444',
      iconColor: '#ffffff',
      titleColor: safeColor('error'),
      borderColor: safeColor('error') + '40'
    },
    warning: {
      icon: '⚠️',
      iconBg: '#f59e0b',
      iconColor: '#ffffff',
      titleColor: safeColor('warning'),
      borderColor: safeColor('warning') + '40'
    },
    info: {
      icon: 'ℹ️',
      iconBg: '#3b82f6',
      iconColor: '#ffffff',
      titleColor: safeColor('primary'),
      borderColor: safeColor('primary') + '40'
    }
  };

  const config = modalConfig[type] || modalConfig.info;

  // Botones por defecto si no se proporcionan
  const defaultButtons = buttons.length > 0 ? buttons : [
    {
      text: 'Aceptar',
      variant: 'primary',
      onClick: onClose
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: safeColor('cardBg'),
        border: `1px solid ${config.borderColor}`,
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '450px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        animation: 'modalSlideIn 0.3s ease',
        position: 'relative'
      }}>
        {/* Botón de cerrar */}
        {showCloseButton && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: safeColor('textMuted'),
              cursor: 'pointer',
              fontSize: '24px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = safeColor('backgroundSecondary');
              e.target.style.color = safeColor('textPrimary');
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = safeColor('textMuted');
            }}
          >
            ×
          </button>
        )}

        {/* Icono */}
        <div style={{
          width: '80px',
          height: '80px',
          background: config.iconBg,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          fontSize: '40px',
          boxShadow: `0 8px 16px ${config.iconBg}40`,
          animation: 'iconBounce 0.6s ease'
        }}>
          {config.icon}
        </div>

        {/* Título */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: config.titleColor,
          margin: '0 0 16px 0',
          lineHeight: '1.3'
        }}>
          {title}
        </h2>

        {/* Mensaje */}
        <p style={{
          fontSize: '1rem',
          color: safeColor('textMuted'),
          margin: '0 0 32px 0',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        {/* Botones */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {defaultButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '120px',
                background: button.variant === 'primary' 
                  ? safeColor('primary') 
                  : button.variant === 'success'
                    ? safeColor('success')
                    : button.variant === 'error'
                      ? safeColor('error')
                      : safeColor('backgroundSecondary'),
                color: button.variant === 'outline' 
                  ? safeColor('textPrimary')
                  : '#ffffff',
                border: button.variant === 'outline' 
                  ? `2px solid ${safeColor('border')}`
                  : 'none',
                boxShadow: button.variant !== 'outline' 
                  ? `0 4px 8px ${button.variant === 'primary' ? safeColor('primary') : button.variant === 'success' ? safeColor('success') : safeColor('error')}40`
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (button.variant === 'outline') {
                  e.target.style.background = safeColor('backgroundSecondary');
                } else {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 12px ${button.variant === 'primary' ? safeColor('primary') : button.variant === 'success' ? safeColor('success') : safeColor('error')}60`;
                }
              }}
              onMouseLeave={(e) => {
                if (button.variant === 'outline') {
                  e.target.style.background = 'transparent';
                } else {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 8px ${button.variant === 'primary' ? safeColor('primary') : button.variant === 'success' ? safeColor('success') : safeColor('error')}40`;
                }
              }}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes iconBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CustomModal;
