import React, { useState, useEffect } from 'react';
import { StudentsService } from '../services';
import { AppTheme } from '../utils/appTheme';

const safeColor = (colorName) => {
  const fallbackColors = {
    primary: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    textPrimary: '#ffffff',
    textMuted: '#9ca3af',
    cardBg: '#1f2937',
    border: '#374151',
    dark: '#111827'
  };
  return AppTheme?.colors?.[colorName] || fallbackColors[colorName] || '#4b5563';
};

const StudentQuizHistory = ({ user, onBack }) => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadQuizHistory();
  }, [user?.id]);

  const loadQuizHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('🔍 Cargando historial de quizzes para estudiante:', user.id);
      
      // Obtener el historial de quizzes del estudiante
      const history = await StudentsService.getStudentQuizHistory(user.id);
      console.log('✅ Historial de quizzes cargado:', history);
      
      setQuizHistory(history || []);
    } catch (error) {
      console.error('❌ Error cargando historial de quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuizDetails = async (quiz) => {
    try {
      setLoadingDetails(true);
      setSelectedQuiz(quiz);
      
      console.log('🔍 Cargando detalles del quiz:', quiz.id);
      
      // Obtener las preguntas y respuestas del quiz
      const details = await StudentsService.getQuizDetails(quiz.id, user.id);
      console.log('✅ Detalles del quiz cargados:', details);
      
      setQuizDetails(details);
    } catch (error) {
      console.error('❌ Error cargando detalles del quiz:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return safeColor('success');
    if (percentage >= 60) return safeColor('warning');
    return safeColor('error');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'fácil': return safeColor('success');
      case 'medio': return safeColor('warning');
      case 'difícil': return safeColor('error');
      default: return safeColor('info');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: safeColor('dark'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: safeColor('textPrimary')
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ margin: 0 }}>Cargando historial...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '32px',
        maxWidth: '1200px',
        margin: '0 auto 32px auto'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: safeColor('textPrimary'),
            fontSize: '24px',
            cursor: 'pointer',
            marginRight: '16px',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = safeColor('cardBg')}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          ←
        </button>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: safeColor('textPrimary'),
          margin: 0
        }}>
          📝 Historial de Quizzes
        </h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {quizHistory.length === 0 ? (
          <div style={{
            background: safeColor('cardBg'),
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            border: `1px solid ${safeColor('border')}`
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>📝</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: safeColor('textPrimary'),
              margin: '0 0 16px 0'
            }}>
              No hay quizzes completados
            </h3>
            <p style={{
              color: safeColor('textMuted'),
              fontSize: '1.1rem',
              margin: 0
            }}>
              Aún no has completado ningún quiz. ¡Comienza a estudiar!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {quizHistory.map((quiz, index) => (
              <div
                key={quiz.id || index}
                style={{
                  background: safeColor('cardBg'),
                  borderRadius: '16px',
                  padding: '24px',
                  border: `1px solid ${safeColor('border')}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => handleViewQuizDetails(quiz)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = safeColor('primary');
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${safeColor('primary')}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = safeColor('border');
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header del quiz */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '600',
                      color: safeColor('textPrimary'),
                      margin: '0 0 8px 0'
                    }}>
                      {quiz.categoryName || 'Categoría'}
                    </h3>
                    <p style={{
                      color: safeColor('textMuted'),
                      margin: 0,
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(quiz.completedAt)}
                    </p>
                  </div>
                  
                  <div style={{
                    textAlign: 'right',
                    minWidth: '120px'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: getScoreColor(quiz.accuracyPercentage),
                      marginBottom: '4px'
                    }}>
                      {quiz.accuracyPercentage}%
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: safeColor('textMuted')
                    }}>
                      {quiz.correctAnswers}/{quiz.totalQuestions} correctas
                    </div>
                  </div>
                </div>

                {/* Stats del quiz */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: safeColor('primary') + '15',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    border: `1px solid ${safeColor('primary')}30`
                  }}>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: safeColor('primary'),
                      marginBottom: '4px'
                    }}>
                      {quiz.totalQuestions}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      Preguntas
                    </div>
                  </div>

                  <div style={{
                    background: safeColor('success') + '15',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    border: `1px solid ${safeColor('success')}30`
                  }}>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: safeColor('success'),
                      marginBottom: '4px'
                    }}>
                      {quiz.correctAnswers}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      Correctas
                    </div>
                  </div>

                  <div style={{
                    background: safeColor('error') + '15',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    border: `1px solid ${safeColor('error')}30`
                  }}>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: safeColor('error'),
                      marginBottom: '4px'
                    }}>
                      {quiz.incorrectAnswers}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      Incorrectas
                    </div>
                  </div>

                  <div style={{
                    background: getDifficultyColor(quiz.difficulty) + '15',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    border: `1px solid ${getDifficultyColor(quiz.difficulty)}30`
                  }}>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: getDifficultyColor(quiz.difficulty),
                      marginBottom: '4px'
                    }}>
                      {quiz.difficulty || 'N/A'}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      Dificultad
                    </div>
                  </div>

                  <div style={{
                    background: safeColor('info') + '15',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    border: `1px solid ${safeColor('info')}30`
                  }}>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: safeColor('info'),
                      marginBottom: '4px'
                    }}>
                      {quiz.timeSpent || '0 min'}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      Tiempo
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: `1px solid ${safeColor('border')}33`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {quiz.explanationsEnabled && (
                      <span style={{
                        background: safeColor('success') + '15',
                        color: safeColor('success'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        border: `1px solid ${safeColor('success')}30`
                      }}>
                        ✓ Explicaciones habilitadas
                      </span>
                    )}
                  </div>
                  
                  <div style={{
                    color: safeColor('primary'),
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    👆 Haz clic para ver detalles
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles del quiz */}
      {selectedQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: safeColor('cardBg'),
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            border: `1px solid ${safeColor('border')}`
          }}>
            {/* Header del modal */}
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${safeColor('border')}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: safeColor('textPrimary'),
                margin: 0
              }}>
                📋 Detalles del Quiz: {selectedQuiz.categoryName}
              </h2>
              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  setQuizDetails(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: safeColor('textMuted'),
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = safeColor('border')}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div style={{
              padding: '24px',
              maxHeight: 'calc(90vh - 120px)',
              overflowY: 'auto'
            }}>
              {loadingDetails ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: safeColor('textPrimary')
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
                  <p>Cargando detalles del quiz...</p>
                </div>
              ) : quizDetails ? (
                <div>
                  {/* Debug: Mostrar datos cargados */}
                  {console.log('🔍 Datos del quiz cargados:', {
                    selectedQuiz,
                    quizDetails,
                    firstQuestion: quizDetails.questions?.[0]
                  })}
                  
                  {/* Resumen del quiz */}
                  <div style={{
                    background: safeColor('primary') + '10',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: `1px solid ${safeColor('primary')}30`
                  }}>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: safeColor('textPrimary'),
                      margin: '0 0 16px 0'
                    }}>
                      📊 Resumen del Quiz
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '16px'
                    }}>
                      <div>
                        <div style={{ color: safeColor('textMuted'), fontSize: '0.9rem' }}>Puntuación</div>
                        <div style={{ color: getScoreColor(selectedQuiz.accuracyPercentage), fontSize: '1.5rem', fontWeight: '600' }}>
                          {selectedQuiz.accuracyPercentage}%
                        </div>
                      </div>
                      <div>
                        <div style={{ color: safeColor('textMuted'), fontSize: '0.9rem' }}>Correctas</div>
                        <div style={{ color: safeColor('success'), fontSize: '1.5rem', fontWeight: '600' }}>
                          {selectedQuiz.correctAnswers}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: safeColor('textMuted'), fontSize: '0.9rem' }}>Incorrectas</div>
                        <div style={{ color: safeColor('error'), fontSize: '1.5rem', fontWeight: '600' }}>
                          {selectedQuiz.incorrectAnswers}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: safeColor('textMuted'), fontSize: '0.9rem' }}>Tiempo</div>
                        <div style={{ color: safeColor('info'), fontSize: '1.5rem', fontWeight: '600' }}>
                          {selectedQuiz.timeSpent || '0 min'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de preguntas */}
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: safeColor('textPrimary'),
                      margin: '0 0 16px 0'
                    }}>
                      📝 Preguntas y Respuestas
                    </h3>
                    
                    {quizDetails.questions?.map((question, index) => (
                      <div
                        key={question.id || index}
                        style={{
                          background: safeColor('dark'),
                          borderRadius: '12px',
                          padding: '20px',
                          marginBottom: '16px',
                          border: `1px solid ${safeColor('border')}`
                        }}
                      >
                        {/* Header de la pregunta */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '16px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '0.9rem',
                              color: safeColor('textMuted'),
                              marginBottom: '8px'
                            }}>
                              Pregunta {index + 1}
                            </div>
                            <h4 style={{
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              color: safeColor('textPrimary'),
                              margin: 0,
                              lineHeight: '1.4'
                            }}>
                              {question.question}
                            </h4>
                          </div>
                          
                          <div style={{
                            marginLeft: '16px',
                            textAlign: 'right'
                          }}>
                            {question.isCorrect ? (
                              <span style={{
                                background: safeColor('success') + '20',
                                color: safeColor('success'),
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: `1px solid ${safeColor('success')}40`
                              }}>
                                ✓ Correcta
                              </span>
                            ) : (
                              <span style={{
                                background: safeColor('error') + '20',
                                color: safeColor('error'),
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: `1px solid ${safeColor('error')}40`
                              }}>
                                ✗ Incorrecta
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Opciones de respuesta */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{
                            fontSize: '0.9rem',
                            color: safeColor('textMuted'),
                            marginBottom: '8px'
                          }}>
                            Opciones:
                          </div>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {question.options?.map((option, optIndex) => {
                              const optionKey = String.fromCharCode(65 + optIndex);
                              const isSelected = question.studentAnswer === optionKey;
                              const isCorrect = question.correctAnswer === option;
                              
                              // Debug logs para la primera pregunta
                              if (index === 0) {
                                console.log('🎯 Debug opción', optionKey, ':', {
                                  option,
                                  correctAnswer: question.correctAnswer,
                                  isCorrect,
                                  isSelected,
                                  studentAnswer: question.studentAnswer
                                });
                              }
                              
                              return (
                                <div
                                  key={optIndex}
                                  style={{
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: `2px solid ${
                                      isCorrect 
                                        ? safeColor('success')
                                        : isSelected && !isCorrect
                                          ? safeColor('error')
                                          : safeColor('border')
                                    }`,
                                    background: isCorrect 
                                      ? safeColor('success') + '10'
                                      : isSelected && !isCorrect
                                        ? safeColor('error') + '10'
                                        : safeColor('cardBg'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                  }}
                                >
                                  <span style={{
                                    fontWeight: '600',
                                    color: isCorrect 
                                      ? safeColor('success')
                                      : isSelected && !isCorrect
                                        ? safeColor('error')
                                        : safeColor('textPrimary'),
                                    minWidth: '20px'
                                  }}>
                                    {optionKey}.
                                  </span>
                                  <span style={{
                                    color: isCorrect 
                                      ? safeColor('success')
                                      : isSelected && !isCorrect
                                        ? safeColor('error')
                                        : safeColor('textPrimary'),
                                    flex: 1
                                  }}>
                                    {option}
                                  </span>
                                  {isCorrect && (
                                    <span style={{ color: safeColor('success'), fontSize: '1.2rem' }}>✓</span>
                                  )}
                                  {isSelected && !isCorrect && (
                                    <span style={{ color: safeColor('error'), fontSize: '1.2rem' }}>✗</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Explicación */}
                        {question.explanation && (
                          <div style={{
                            background: safeColor('info') + '10',
                            borderRadius: '8px',
                            padding: '16px',
                            border: `1px solid ${safeColor('info')}30`
                          }}>
                            <div style={{
                              fontSize: '0.9rem',
                              color: safeColor('info'),
                              fontWeight: '600',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              💡 Explicación:
                            </div>
                            <p style={{
                              color: safeColor('textPrimary'),
                              margin: 0,
                              lineHeight: '1.5'
                            }}>
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: safeColor('textMuted')
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>❌</div>
                  <p>No se pudieron cargar los detalles del quiz</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizHistory;
