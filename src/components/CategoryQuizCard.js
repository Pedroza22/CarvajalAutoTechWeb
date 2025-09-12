import React, { useState } from 'react';
import { AppConstants } from '../utils/constants';

// Fallback colors en caso de que AppConstants no esté disponible
const fallbackColors = {
  dark: '#0f0f0f',
  textPrimary: '#ffffff',
  border: '#4b5563',
  primary: '#3b82f6',
  cardBg: '#1f2937',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b'
};

// Función segura para obtener colores
const safeColor = (colorName) => {
  return AppConstants?.colors?.[colorName] || fallbackColors[colorName] || '#4b5563';
};

const CategoryQuizCard = ({ category, onTap, onStartQuiz, onViewQuestions }) => {
  // const [isPressed, setIsPressed] = useState(false);

  // Lista de colores para asignar por categoría
  const categoryColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // orange
    '#EF4444', // red
    '#14B8A6', // teal
    '#6366F1', // indigo
    '#EC4899', // pink
    '#F59E0B', // amber
    '#06B6D4', // cyan
  ];

  // Función que asegura que el progreso nunca sea NaN o Infinity
  const safeProgress = (completed, total) => {
    if (total <= 0) return 0.0;
    const progress = completed / total;
    return Math.min(Math.max(progress, 0.0), 1.0);
  };

  // Obtiene un color en base al nombre de la categoría
  const getCategoryColor = (name) => {
    const index = name.charCodeAt(0) % categoryColors.length;
    return categoryColors[index];
  };

  const getScoreColor = (score) => {
    if (score >= 90) return safeColor('success');
    if (score >= 80) return safeColor('primary');
    if (score >= 70) return safeColor('warning');
    return safeColor('error');
  };

  const name = category.name || '';
  const completed = category.completed || 0;
  const questionCount = category.questionCount || 0;
  const progress = safeProgress(completed, questionCount);
  const lastScore = category.lastScore;
  const color = getCategoryColor(name);

  const handleViewQuestions = (e) => {
    e.stopPropagation();
    if (onViewQuestions) onViewQuestions();
  };

  const handleStartQuiz = (e) => {
    e.stopPropagation();
    if (onStartQuiz) onStartQuiz();
  };

  return (
    <div
      style={{
        padding: '20px',
        background: `linear-gradient(135deg, ${safeColor('cardBg')}, ${color}0D)`,
        borderRadius: '16px',
        border: `1px solid ${color}4D`,
        boxShadow: `0 2px 8px ${color}1A`,
        transition: 'all 0.15s ease',
        marginBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Recuadro con la primera letra */}
        <div style={{
          width: '60px',
          height: '60px',
          background: `linear-gradient(135deg, ${color}, ${color}CC)`,
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 2px 8px ${color}4D`,
          marginRight: '16px'
        }}>
          <span style={{
            color: safeColor('textPrimary'),
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            {name.length > 0 ? name[0].toUpperCase() : "?"}
          </span>
        </div>

        {/* Información */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: safeColor('textPrimary'),
            marginBottom: '4px'
          }}>
            {name}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: safeColor('greyLight'),
            marginBottom: '12px'
          }}>
            {category.description || ''}
          </div>

          {/* Progreso */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                color: safeColor('greyLight'),
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                Progreso: {completed}/{questionCount}
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                background: `${safeColor('border')}4D`,
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress * 100}%`,
                  height: '100%',
                  background: color,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Última puntuación */}
              {lastScore !== null && (
                <div style={{
                  padding: '6px 12px',
                  background: `${getScoreColor(lastScore)}33`,
                  borderRadius: '12px',
                  border: `1px solid ${getScoreColor(lastScore)}80`,
                  color: getScoreColor(lastScore),
                  fontSize: '12px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {lastScore}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginLeft: '16px'
        }}>
          <button
            onClick={handleViewQuestions}
            style={{
              background: 'transparent',
              border: `1px solid ${color}`,
              color: color,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = color;
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = color;
            }}
          >
            📝 Ver Preguntas
          </button>
          
          <button
            onClick={handleStartQuiz}
            style={{
              background: color,
              border: `1px solid ${color}`,
              color: 'white',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = color;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = color;
              e.target.style.color = 'white';
            }}
          >
            🚀 Comenzar Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryQuizCard;
