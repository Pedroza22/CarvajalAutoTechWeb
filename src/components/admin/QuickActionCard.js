import React, { useState } from 'react';
import { AppTheme } from '../../utils/appTheme';

const QuickActionCard = ({ 
  title, 
  subtitle, 
  icon, 
  color, 
  onTap 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsPressed(false);
    setIsHovered(false);
  };

  const cardStyle = {
    height: '140px',
    background: AppTheme.gradients.cardGradient,
    borderRadius: AppTheme.borderRadius.large,
    border: `1px solid ${color}33`, // 20% opacity
    boxShadow: isHovered 
      ? `0 8px 16px ${color}33, 0 12px 24px rgba(0, 0, 0, 0.3)`
      : `0 4px 8px ${color}20, 0 8px 16px rgba(0, 0, 0, 0.2)`,
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transform: isPressed ? 'scale(0.95)' : 'scale(1)',
    transition: 'all 0.15s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    justifyContent: 'center',
    alignItems: 'flex-start',
  };

  const iconContainerStyle = {
    width: '50px',
    height: '50px',
    background: `${color}26`, // 15% opacity
    borderRadius: AppTheme.borderRadius.medium,
    border: `1px solid ${color}4D`, // 30% opacity
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  };

  const titleStyle = {
    color: AppTheme.white,
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    lineHeight: '1.2',
  };

  const subtitleStyle = {
    color: AppTheme.greyLight,
    fontSize: '12px',
    fontWeight: '400',
    letterSpacing: '0.3px',
    lineHeight: '1.2',
  };

  const shineEffectStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '60px',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
  };

  const bottomLineStyle = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '3px',
    background: `linear-gradient(90deg, transparent 0%, ${color}99 50%, transparent 100%)`,
    pointerEvents: 'none',
  };

  const pressedOverlayStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: `${color}14`, // 8% opacity
    borderRadius: AppTheme.borderRadius.large,
    pointerEvents: 'none',
  };

  return (
    <div
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={onTap}
    >
      {/* Efecto de brillo */}
      <div style={shineEffectStyle} />
      
      {/* Contenido principal */}
      <div style={iconContainerStyle}>
        <span style={{ color, fontSize: '26px' }}>
          {icon}
        </span>
      </div>
      
      <div style={titleStyle}>
        {title}
      </div>
      
      <div style={subtitleStyle}>
        {subtitle}
      </div>
      
      {/* Línea decorativa inferior */}
      <div style={bottomLineStyle} />
      
      {/* Overlay cuando está presionado */}
      {isPressed && <div style={pressedOverlayStyle} />}
    </div>
  );
};

export default QuickActionCard;
