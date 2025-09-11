import React, { useState, useEffect } from 'react';
import { AppConstants } from '../utils/constants';
import CustomButton from './CustomButton';

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

const QuizResultScreen = ({ results, onRetry, onBackToDashboard }) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationStep(1), 500);
    return () => clearTimeout(timer);
  }, []);

  const getResultColor = () => {
    const accuracy = results.accuracy;
    if (accuracy >= 90) return safeColor('success');
    if (accuracy >= 80) return safeColor('primary');
    if (accuracy >= 70) return safeColor('warning');
    return safeColor('error');
  };

  const getResultMessage = () => {
    const accuracy = results.accuracy;
    if (accuracy >= 90) return '¡Excelente trabajo! 🎉';
    if (accuracy >= 80) return '¡Muy bien! 👏';
    if (accuracy >= 70) return 'Buen trabajo! 👍';
    return 'Sigue practicando! 💪';
  };

  const resultColor = getResultColor();

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      color: safeColor('textPrimary'),
      padding: '16px'
    }}>
      {/* Header */}
      <div style={{
        background: safeColor('dark'),
        padding: '16px 0',
        borderBottom: `1px solid ${safeColor('border')}33`,
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          margin: 0,
          textAlign: 'center'
        }}>
          Resultados del Quiz
        </h1>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Resultado Principal */}
        <div style={{
          background: `linear-gradient(135deg, ${resultColor}20, ${resultColor}10)`,
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '32px',
          border: `2px solid ${resultColor}40`
        }}>
          {/* Icono animado */}
          <div style={{
            width: '80px',
            height: '80px',
            background: `${safeColor('textPrimary')}33`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '40px',
            transform: animationStep ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}>
            {results.accuracy >= 80 ? '🎉' : results.accuracy >= 70 ? '👍' : '💪'}
          </div>

          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '8px',
            color: resultColor
          }}>
            {results.accuracy.toFixed(1)}%
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '16px',
            color: safeColor('textMuted')
          }}>
            {getResultMessage()}
          </p>

          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            {results.correctAnswers} de {results.totalQuestions} preguntas correctas
          </p>
        </div>

        {/* Estadísticas Detalladas */}
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: `1px solid ${safeColor('border')}4D`
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '20px',
            color: safeColor('textPrimary')
          }}>
            Estadísticas
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            {[
              { label: 'Correctas', value: results.correctAnswers, icon: '✓', color: safeColor('success') },
              { label: 'Incorrectas', value: results.incorrectAnswers, icon: '✗', color: safeColor('error') },
              { label: 'Total', value: results.totalQuestions, icon: '❓', color: safeColor('primary') }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  background: `${stat.color}10`,
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: `1px solid ${stat.color}30`
                }}
              >
                <div style={{
                  fontSize: '24px',
                  marginBottom: '8px'
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: stat.color,
                  marginBottom: '4px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: safeColor('textMuted')
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Barra de progreso visual */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: `${safeColor('border')}20`,
            borderRadius: '12px'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '8px',
              color: safeColor('textMuted')
            }}>
              Progreso Visual
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: `${safeColor('border')}4D`,
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(results.correctAnswers / results.totalQuestions) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${safeColor('success')}, ${safeColor('primary')})`,
                borderRadius: '8px',
                transition: 'width 1s ease'
              }}></div>
            </div>
          </div>
        </div>

        {/* Detalle de Preguntas */}
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: `1px solid ${safeColor('border')}4D`
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '20px',
            color: safeColor('textPrimary')
          }}>
            Detalle de Respuestas
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {results.questions.map((question, index) => {
              const isCorrect = question.isCorrect;
              return (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: isCorrect 
                      ? `${safeColor('success')}1A`
                      : `${safeColor('error')}1A`,
                    borderLeft: `4px solid ${isCorrect ? safeColor('success') : safeColor('error')}`,
                    borderRadius: '8px',
                    borderBottom: index < results.questions.length - 1 ? `1px solid ${safeColor('border')}33` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {/* Número de pregunta */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: isCorrect ? safeColor('success') : safeColor('error'),
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      <span style={{
                        color: safeColor('textPrimary'),
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Contenido de la pregunta */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        margin: '0 0 8px 0',
                        color: safeColor('textPrimary')
                      }}>
                        {question.text}
                      </h4>
                      
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: safeColor('textMuted')
                        }}>
                          <strong>Tu respuesta:</strong> {question.userAnswer || 'Sin respuesta'}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: safeColor('textMuted')
                        }}>
                          <strong>Respuesta correcta:</strong> {question.correctAnswer}
                        </div>
                        {question.timeSpent > 0 && (
                          <div style={{
                            fontSize: '0.875rem',
                            color: safeColor('textMuted')
                          }}>
                            <strong>Tiempo:</strong> {question.timeSpent.toFixed(1)}s
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Icono de resultado */}
                    <div style={{
                      fontSize: '24px',
                      marginLeft: '12px'
                    }}>
                      {isCorrect ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botones de Acción */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center'
        }}>
          <CustomButton
            text="Intentar de Nuevo"
            onClick={onRetry}
            icon="🔄"
            style={{
              background: `linear-gradient(135deg, ${safeColor('primary')}, ${safeColor('primary')}CC)`,
              marginBottom: '12px'
            }}
          />

          <CustomButton
            text="Volver al Dashboard"
            onClick={onBackToDashboard}
            icon="🏠"
            variant="outlined"
            style={{
              border: `1px solid ${safeColor('primary')}`,
              color: safeColor('primary'),
              background: 'transparent',
              marginBottom: '12px'
            }}
          />

          <CustomButton
            text="Compartir Resultado"
            onClick={() => alert('Función de compartir próximamente')}
            icon="📤"
            style={{
              background: safeColor('border')
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizResultScreen;