import React, { useState } from 'react';
import { AppTheme } from '../../utils/appTheme';

const CategoryCard = ({ 
  category, 
  onEdit, 
  onDelete, 
  onTap,
  showActions = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsPressed(false);
    setIsHovered(false);
  };

  // Generar color basado en el nombre de la categoría
  const getCategoryColor = () => {
    const colorIndex = category.name.hashCode ? category.name.hashCode() % 4 : 0;
    const colors = [AppTheme.primaryRed, AppTheme.success, AppTheme.info, AppTheme.warning];
    return colors[Math.abs(colorIndex)];
  };

  const categoryColor = getCategoryColor();

  const cardStyle = {
    background: AppTheme.gradients.cardGradient,
    borderRadius: AppTheme.borderRadius.large,
    border: `1px solid ${isHovered ? `${categoryColor}80` : `${AppTheme.greyDark}50`}`,
    boxShadow: isHovered 
      ? `0 8px 16px ${categoryColor}20, 0 12px 24px rgba(0, 0, 0, 0.3)`
      : `0 4px 8px ${categoryColor}10, 0 8px 16px rgba(0, 0, 0, 0.2)`,
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
    transition: 'all 0.2s ease-in-out',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '200px',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  };

  const iconContainerStyle = {
    width: '48px',
    height: '48px',
    background: `${categoryColor}26`, // 15% opacity
    borderRadius: AppTheme.borderRadius.medium,
    border: `1px solid ${categoryColor}4D`, // 30% opacity
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
  };

  const iconTextStyle = {
    color: categoryColor,
    fontSize: '20px',
    fontWeight: '700',
  };

  const actionsStyle = {
    display: 'flex',
    gap: '6px',
    marginLeft: 'auto',
  };

  const actionButtonStyle = (color) => ({
    width: '36px',
    height: '36px',
    background: `${color}1A`, // 10% opacity
    borderRadius: '8px',
    border: `1px solid ${color}33`, // 20% opacity
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
  });

  const actionIconStyle = (color) => ({
    color: color,
    fontSize: '16px',
  });

  const titleStyle = {
    color: AppTheme.white,
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    lineHeight: '1.2',
  };

  const descriptionStyle = {
    color: AppTheme.greyLight,
    fontSize: '13px',
    fontWeight: '400',
    lineHeight: '1.3',
    flex: 1,
    marginBottom: '12px',
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: 'auto',
  };

  const statItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const statIconStyle = (color) => ({
    color: color,
    fontSize: '14px',
  });

  const statValueStyle = {
    color: AppTheme.white,
    fontSize: '12px',
    fontWeight: '600',
  };

  const statLabelStyle = {
    color: AppTheme.greyMedium,
    fontSize: '10px',
    fontWeight: '400',
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}a`;
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
      {/* Header con icono y acciones */}
      <div style={headerStyle}>
        <div style={iconContainerStyle}>
          <span style={iconTextStyle}>
            {category.name && category.name.length > 0 
              ? category.name[0].toUpperCase() 
              : '?'}
          </span>
        </div>
        
        {showActions && (
          <div style={actionsStyle}>
            <div 
              style={actionButtonStyle(AppTheme.info)}
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit();
              }}
            >
              <span style={actionIconStyle(AppTheme.info)}>✏️</span>
            </div>
            <div 
              style={actionButtonStyle(AppTheme.error)}
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
            >
              <span style={actionIconStyle(AppTheme.error)}>🗑️</span>
            </div>
          </div>
        )}
      </div>

      {/* Título */}
      <div style={titleStyle}>
        {category.name}
      </div>

      {/* Descripción */}
      <div style={descriptionStyle}>
        {category.description || 'Sin descripción disponible para esta categoría'}
      </div>

      {/* Footer con estadísticas */}
      <div style={footerStyle}>
        <div style={statItemStyle}>
          <span style={statIconStyle(categoryColor)}>❓</span>
          <div>
            <div style={statValueStyle}>
              {category.questionCount || 0}
            </div>
            <div style={statLabelStyle}>
              Preguntas
            </div>
          </div>
        </div>
        
        {category.createdAt && (
          <div style={statItemStyle}>
            <span style={statIconStyle(AppTheme.greyMedium)}>🕒</span>
            <div>
              <div style={statValueStyle}>
                {formatDate(category.createdAt)}
              </div>
              <div style={statLabelStyle}>
                Creada
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Función helper para generar hash simple
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export default CategoryCard;
