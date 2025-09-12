import React, { useState, useEffect } from 'react';
import { getColor } from '../utils/constants';
import StudentCategoriesService from '../services/StudentCategoriesService';
import CustomButton from './CustomButton';

const CategoryQuestionsPage = ({ category, user, onBack, onStartQuiz }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnswers: 0,
    correctAnswers: 0,
    accuracy: 0
  });

  useEffect(() => {
    loadCategoryData();
  }, [category?.id, user?.id]);

  const loadCategoryData = async () => {
    if (!category?.id || !user?.id) return;

    try {
      setLoading(true);
      const [questionsData, statsData] = await Promise.all([
        StudentCategoriesService.getCategoryQuestions(category.id, user.id),
        StudentCategoriesService.getCategoryStats(user.id, category.id)
      ]);

      setQuestions(questionsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error cargando datos de categoría:', error);
    } finally {
      setLoading(false);
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice': return '📝';
      case 'true_false': return '✅';
      case 'free_text': return '✍️';
      default: return '❓';
    }
  };

  const getQuestionTypeText = (type) => {
    switch (type) {
      case 'multiple_choice': return 'Opción Múltiple';
      case 'true_false': return 'Verdadero/Falso';
      case 'free_text': return 'Texto Libre';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: safeColor('dark'),
        color: safeColor('textPrimary'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      color: safeColor('textPrimary')
    }}>
      {/* Header */}
      <div style={{
        background: safeColor('dark'),
        padding: '16px',
        borderBottom: `1px solid ${safeColor('border')}33`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: safeColor('textPrimary'),
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              ←
            </button>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0
              }}>
                {category?.name || 'Categoría'}
              </h1>
              <p style={{
                fontSize: '0.9rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                {category?.description || 'Sin descripción'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px'
      }}>
        {/* Stats Card */}
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: `1px solid ${safeColor('border')}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: category?.color ? `${category.color}20` : safeColor('primary') + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              {category?.icon || '📚'}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: '700',
                color: safeColor('textPrimary'),
                margin: '0 0 6px 0'
              }}>
                {category?.name || 'Categoría'}
              </h2>
              <p style={{
                fontSize: '0.9rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                {questions.length} preguntas disponibles
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: safeColor('success') + '20',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${safeColor('success')}33`
            }}>
              <div style={{
                fontSize: '1.5rem',
                marginBottom: '8px'
              }}>✅</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: safeColor('success'),
                marginBottom: '4px'
              }}>
                {stats.correctAnswers}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: safeColor('textMuted')
              }}>
                Correctas
              </div>
            </div>

            <div style={{
              background: safeColor('error') + '20',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${safeColor('error')}33`
            }}>
              <div style={{
                fontSize: '1.5rem',
                marginBottom: '8px'
              }}>❌</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: safeColor('error'),
                marginBottom: '4px'
              }}>
                {stats.incorrectAnswers}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: safeColor('textMuted')
              }}>
                Incorrectas
              </div>
            </div>

            <div style={{
              background: safeColor('warning') + '20',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${safeColor('warning')}33`
            }}>
              <div style={{
                fontSize: '1.5rem',
                marginBottom: '8px'
              }}>📊</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: safeColor('warning'),
                marginBottom: '4px'
              }}>
                {stats.accuracy}%
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: safeColor('textMuted')
              }}>
                Precisión
              </div>
            </div>

            <div style={{
              background: safeColor('primary') + '20',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${safeColor('primary')}33`
            }}>
              <div style={{
                fontSize: '1.5rem',
                marginBottom: '8px'
              }}>❓</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: safeColor('primary'),
                marginBottom: '4px'
              }}>
                {questions.length}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: safeColor('textMuted')
              }}>
                Preguntas
              </div>
            </div>
          </div>

          {/* Start Quiz Button */}
          {questions.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <CustomButton
                onClick={() => onStartQuiz(category.id)}
                text="Comenzar Quiz"
                variant="primary"
                size="large"
                icon="🚀"
                fullWidth={false}
                style={{
                  background: category?.color || safeColor('primary'),
                  border: `1px solid ${category?.color || safeColor('primary')}`,
                  fontSize: '1.1rem',
                  padding: '12px 32px'
                }}
              />
            </div>
          )}
        </div>

        {/* Questions List */}
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${safeColor('border')}`
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: safeColor('textPrimary'),
            margin: '0 0 20px 0'
          }}>
            Preguntas Disponibles
          </h3>

          {questions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: safeColor('textMuted')
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>No hay preguntas disponibles en esta categoría</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  style={{
                    background: safeColor('dark'),
                    borderRadius: '12px',
                    padding: '20px',
                    border: `1px solid ${safeColor('border')}33`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    {/* Question Number */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: safeColor('primary'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>

                    {/* Question Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {getQuestionTypeIcon(question.type)}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          color: safeColor('textMuted'),
                          background: safeColor('border') + '33',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          {getQuestionTypeText(question.type)}
                        </span>
                        {question.time_limit && (
                          <span style={{
                            fontSize: '0.8rem',
                            color: safeColor('warning'),
                            background: safeColor('warning') + '20',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}>
                            ⏱️ {question.time_limit}s
                          </span>
                        )}
                      </div>

                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: safeColor('textPrimary'),
                        margin: '0 0 8px 0',
                        lineHeight: '1.4'
                      }}>
                        {question.question}
                      </h4>

                      {/* Options for multiple choice */}
                      {question.type === 'multiple_choice' && question.options && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: safeColor('border') + '20',
                          borderRadius: '8px'
                        }}>
                          <p style={{
                            fontSize: '0.8rem',
                            color: safeColor('textMuted'),
                            margin: '0 0 8px 0'
                          }}>
                            Opciones:
                          </p>
                          <div style={{
                            display: 'grid',
                            gap: '4px'
                          }}>
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                style={{
                                  fontSize: '0.9rem',
                                  color: safeColor('textPrimary'),
                                  padding: '4px 8px',
                                  background: safeColor('cardBg'),
                                  borderRadius: '4px'
                                }}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Image if available */}
                      {question.image_url && (
                        <div style={{
                          marginTop: '12px',
                          textAlign: 'center'
                        }}>
                          <img
                            src={question.image_url}
                            alt="Pregunta"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              border: `1px solid ${safeColor('border')}`
                            }}
                          />
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: safeColor('success') + '20',
                          borderRadius: '8px',
                          border: `1px solid ${safeColor('success')}33`
                        }}>
                          <p style={{
                            fontSize: '0.8rem',
                            color: safeColor('textMuted'),
                            margin: '0 0 4px 0'
                          }}>
                            💡 Explicación:
                          </p>
                          <p style={{
                            fontSize: '0.9rem',
                            color: safeColor('textPrimary'),
                            margin: 0,
                            lineHeight: '1.4'
                          }}>
                            {question.explanation}
                          </p>
                        </div>
                      )}

                      <div style={{
                        marginTop: '12px',
                        fontSize: '0.8rem',
                        color: safeColor('textMuted')
                      }}>
                        Creada: {formatDate(question.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryQuestionsPage;
