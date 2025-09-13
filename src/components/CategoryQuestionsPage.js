import React, { useState, useEffect, useCallback } from 'react';
import { getColor } from '../utils/constants';
import StudentCategoriesService from '../services/StudentCategoriesService';
import CustomButton from './CustomButton';

const CategoryQuestionsPage = ({ category, user, onBack, onStartQuiz }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizStats, setQuizStats] = useState(null);
  const [savingAnswers, setSavingAnswers] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [stats, setStats] = useState({
    totalAnswers: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0
  });

  const loadCategoryData = useCallback(async () => {
    if (!category?.id || !user?.id) return;

    try {
      setLoading(true);
      // Solo cargar estadísticas inicialmente, no las preguntas
      const statsData = await StudentCategoriesService.getCategoryStats(user.id, category.id);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error cargando datos de categoría:', error);
    } finally {
      setLoading(false);
    }
  }, [category?.id, user?.id]);

  const loadQuestions = useCallback(async () => {
    if (!category?.id || !user?.id) return;

    try {
      setLoading(true);
      const questionsData = await StudentCategoriesService.getCategoryQuestions(category.id, user.id);
      setQuestions(questionsData);
    } catch (error) {
      console.error('❌ Error cargando preguntas:', error);
    } finally {
      setLoading(false);
    }
  }, [category?.id, user?.id]);

  const handleStartQuiz = async () => {
    setQuizStarted(true);
    await loadQuestions();
  };

  const handleAnswerSelect = (questionId, answer) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // NO avanzar automáticamente - el usuario debe presionar "Siguiente" o esperar a que se acabe el tiempo
    console.log('✅ Respuesta seleccionada:', answer, 'para pregunta:', questionId);
  };

  const handleSubmitQuiz = async () => {
    try {
      setSavingAnswers(true);
      console.log('🚀 Iniciando envío del quiz...');
      
      // Guardar respuestas en la base de datos
      await StudentCategoriesService.saveStudentAnswers(user.id, category.id, studentAnswers);
      
      // Calcular estadísticas
      const stats = await StudentCategoriesService.calculateQuizStats(user.id, category.id, studentAnswers);
      setQuizStats(stats);
      
      setQuizCompleted(true);
      console.log('✅ Quiz completado y guardado:', stats);
    } catch (error) {
      console.error('❌ Error enviando quiz:', error);
      // Aún así marcar como completado para mostrar estadísticas locales
      const totalAnswered = Object.keys(studentAnswers).length;
      const localStats = {
        totalQuestions: questions.length,
        totalAnswers: totalAnswered,
        correctAnswers: 0, // No podemos calcular sin conexión
        incorrectAnswers: totalAnswered, // Asumir todas incorrectas por ahora
        accuracy: 0,
        completionRate: Math.round((totalAnswered / questions.length) * 100),
        score: 0,
        maxScore: questions.length
      };
      setQuizStats(localStats);
      setQuizCompleted(true);
    } finally {
      setSavingAnswers(false);
    }
  };

  const handleViewResults = () => {
    setShowResults(true);
  };

  // Función para iniciar el temporizador de una pregunta
  const startQuestionTimer = (question) => {
    if (question.time_limit && question.time_limit > 0) {
      setTimeLeft(question.time_limit);
      setTimerActive(true);
    } else {
      setTimeLeft(null);
      setTimerActive(false);
    }
  };

  // Función para manejar el timeout de una pregunta
  const handleQuestionTimeout = (questionId) => {
    console.log('⏰ Tiempo agotado para pregunta:', questionId);
    // Marcar como incorrecta (no se selecciona ninguna respuesta)
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: 'TIMEOUT'
    }));
    
    // Detener el temporizador
    setTimerActive(false);
    
    // Avanzar a la siguiente pregunta automáticamente después de un breve delay
    setTimeout(() => {
      nextQuestion();
    }, 1500); // 1.5 segundos para que el usuario vea que se acabó el tiempo
  };

  // Función para avanzar a la siguiente pregunta
  const nextQuestion = () => {
    // Detener el temporizador actual
    setTimerActive(false);
    
    console.log('🔄 Navegando a siguiente pregunta. Actual:', currentQuestionIndex, 'Total:', questions.length);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => {
        const next = prev + 1;
        console.log('➡️ Avanzando a pregunta:', next + 1);
        return next;
      });
    } else {
      // Si es la última pregunta, completar el quiz
      console.log('🏁 Última pregunta alcanzada, completando quiz...');
      handleSubmitQuiz();
    }
  };

  // Función para ir a la pregunta anterior
  const previousQuestion = () => {
    // Detener el temporizador actual
    setTimerActive(false);
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  // Effect para manejar el temporizador
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            // Tiempo agotado
            setTimerActive(false);
            const currentQuestion = questions[currentQuestionIndex];
            if (currentQuestion) {
              handleQuestionTimeout(currentQuestion.id);
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timeLeft, currentQuestionIndex, questions]);

  // Effect para iniciar el temporizador cuando cambia la pregunta
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      startQuestionTimer(currentQuestion);
    }
  }, [currentQuestionIndex, questions]);

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
          {!quizStarted ? (
            // Pantalla de inicio del quiz
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎯</div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: safeColor('textPrimary'),
                margin: '0 0 16px 0'
              }}>
                ¡Comienza el Quiz!
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: safeColor('textMuted'),
                margin: '0 0 32px 0',
                lineHeight: '1.6'
              }}>
                {category?.description || 'Pon a prueba tus conocimientos en esta categoría.'}
              </p>
              
              {/* Estadísticas previas */}
              {stats.totalAnswers > 0 && (
                <div style={{
                  background: safeColor('cardBg'),
                  borderRadius: '12px',
                  padding: '20px',
                  margin: '0 0 32px 0',
                  border: `1px solid ${safeColor('border')}33`
                }}>
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    margin: '0 0 12px 0'
                  }}>
                    Tu Progreso Anterior
                  </h4>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: '20px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: safeColor('primary')
                      }}>
                        {stats.totalAnswers}
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: safeColor('textMuted')
                      }}>
                        Respuestas
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: safeColor('success')
                      }}>
                        {stats.accuracy}%
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: safeColor('textMuted')
                      }}>
                        Precisión
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <CustomButton
                text="🚀 Comenzar Quiz"
                onClick={handleStartQuiz}
                style={{
                  fontSize: '1.2rem',
                  padding: '16px 32px',
                  minWidth: '200px'
                }}
              />
            </div>
          ) : questions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: safeColor('textMuted')
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>No hay preguntas disponibles en esta categoría</p>
            </div>
          ) : (
            <div>
              {/* Header con progreso y temporizador */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '16px',
                background: safeColor('cardBg'),
                borderRadius: '12px',
                border: `1px solid ${safeColor('border')}33`
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    margin: '0 0 4px 0'
                  }}>
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                  </h3>
                  <div style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted')
                  }}>
                    Progreso: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </div>
                </div>
                
                {/* Temporizador */}
                {timeLeft !== null && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: timeLeft <= 10 ? safeColor('error') + '20' : safeColor('primary') + '20',
                    borderRadius: '20px',
                    border: `2px solid ${timeLeft <= 10 ? safeColor('error') : safeColor('primary')}`
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>⏱️</span>
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: timeLeft <= 10 ? safeColor('error') : safeColor('primary')
                    }}>
                      {timeLeft}s
                    </span>
                  </div>
                )}
              </div>

              {/* Pregunta actual */}
              {questions[currentQuestionIndex] && (
                <div style={{
                  background: safeColor('dark'),
                  borderRadius: '12px',
                  padding: '24px',
                  border: `1px solid ${safeColor('border')}33`
                }}>
                  {(() => {
                    const question = questions[currentQuestionIndex];
                    return (
                      <div>
                        {/* Información de la pregunta */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '16px'
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

                        {/* Pregunta */}
                        <h4 style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: safeColor('textPrimary'),
                          margin: '0 0 20px 0',
                          lineHeight: '1.4'
                        }}>
                          {question.question}
                        </h4>

                        {/* Debug info */}
                        {process.env.NODE_ENV === 'development' && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: '#333',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            color: '#fff'
                          }}>
                            <strong>Debug:</strong> type={question.type || 'undefined'}, 
                            hasOptions={!!question.options}, 
                            optionsType={typeof question.options},
                            optionsLength={Array.isArray(question.options) ? question.options.length : 'N/A'}
                          </div>
                        )}

                        {/* Opciones de respuesta */}
                        {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                          <div style={{
                            marginTop: '20px'
                          }}>
                            <p style={{
                              fontSize: '0.9rem',
                              color: safeColor('textMuted'),
                              margin: '0 0 12px 0'
                            }}>
                              Selecciona tu respuesta:
                            </p>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              {question.options.map((option, optIndex) => {
                                const optionKey = String.fromCharCode(65 + optIndex);
                                const isSelected = studentAnswers[question.id] === optionKey;
                                const isCorrect = question.correct_answer === optionKey;
                                const showCorrect = showResults && isCorrect;
                                const showIncorrect = showResults && isSelected && !isCorrect;
                                
                                return (
                                  <button
                                    key={optIndex}
                                    onClick={() => !showResults && handleAnswerSelect(question.id, optionKey)}
                                    disabled={showResults}
                                    style={{
                                      padding: '16px 20px',
                                      background: showCorrect 
                                        ? safeColor('success') + '20' 
                                        : showIncorrect 
                                          ? safeColor('error') + '20'
                                          : isSelected 
                                            ? safeColor('primary') + '20'
                                            : safeColor('cardBg'),
                                      borderRadius: '12px',
                                      border: `2px solid ${
                                        showCorrect 
                                          ? safeColor('success')
                                          : showIncorrect 
                                            ? safeColor('error')
                                            : isSelected 
                                              ? safeColor('primary')
                                              : safeColor('border') + '33'
                                      }`,
                                      fontSize: '1rem',
                                      color: safeColor('textPrimary'),
                                      cursor: showResults ? 'default' : 'pointer',
                                      transition: 'all 0.2s',
                                      textAlign: 'left',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px'
                                    }}
                                  >
                                    <span style={{
                                      fontWeight: '600',
                                      minWidth: '24px',
                                      fontSize: '1.1rem'
                                    }}>
                                      {optionKey}.
                                    </span>
                                    <span>{option}</span>
                                    {showCorrect && <span style={{ color: safeColor('success'), fontSize: '1.2rem' }}>✓</span>}
                                    {showIncorrect && <span style={{ color: safeColor('error'), fontSize: '1.2rem' }}>✗</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Mensaje si no hay opciones */}
                        {!question.options && (
                          <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: safeColor('error') + '20',
                            borderRadius: '8px',
                            border: `1px solid ${safeColor('error')}33`
                          }}>
                            <p style={{
                              fontSize: '0.9rem',
                              color: safeColor('error'),
                              margin: 0
                            }}>
                              ⚠️ Esta pregunta no tiene opciones de respuesta configuradas
                            </p>
                          </div>
                        )}

                        {/* Imagen si está disponible */}
                        {question.image_url && (
                          <div style={{
                            marginTop: '20px',
                            textAlign: 'center'
                          }}>
                            <img
                              src={question.image_url}
                              alt="Imagen de la pregunta"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '8px',
                                border: `1px solid ${safeColor('border')}`
                              }}
                            />
                          </div>
                        )}

                        {/* Explicación - Solo se muestra después de que el admin publique resultados */}
                        {question.explanation && showResults && (
                          <div style={{
                            marginTop: '20px',
                            padding: '16px',
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
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Botones de navegación */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '24px',
                padding: '16px',
                background: safeColor('cardBg'),
                borderRadius: '12px',
                border: `1px solid ${safeColor('border')}33`
              }}>
                <CustomButton
                  text="← Anterior"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  style={{
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                  }}
                />
                
                <div style={{
                  fontSize: '0.9rem',
                  color: safeColor('textMuted')
                }}>
                  {currentQuestionIndex + 1} de {questions.length}
                </div>
                
                <CustomButton
                  text={currentQuestionIndex === questions.length - 1 ? "Finalizar" : "Siguiente →"}
                  onClick={currentQuestionIndex === questions.length - 1 ? handleSubmitQuiz : nextQuestion}
                  disabled={false} // Permitir finalizar siempre, incluso sin respuesta
                  style={{
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Resultados del Quiz Completado */}
          {quizCompleted && quizStats && (
            <div style={{
              background: safeColor('cardBg'),
              borderRadius: '16px',
              padding: '32px',
              marginTop: '24px',
              border: `1px solid ${safeColor('border')}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: safeColor('textPrimary'),
                margin: '0 0 16px 0'
              }}>
                ¡Quiz Completado!
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: safeColor('textMuted'),
                margin: '0 0 32px 0'
              }}>
                Has terminado el quiz de {category?.name || 'esta categoría'}
              </p>

              {/* Estadísticas del Quiz */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
              }}>
                <div style={{
                  background: safeColor('primary') + '20',
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${safeColor('primary')}33`
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❓</div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: safeColor('primary'),
                    marginBottom: '4px'
                  }}>
                    {quizStats.totalQuestions}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted')
                  }}>
                    Preguntas
                  </div>
                </div>

                <div style={{
                  background: safeColor('success') + '20',
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${safeColor('success')}33`
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: safeColor('success'),
                    marginBottom: '4px'
                  }}>
                    {quizStats.correctAnswers}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted')
                  }}>
                    Correctas
                  </div>
                </div>

                <div style={{
                  background: safeColor('error') + '20',
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${safeColor('error')}33`
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: safeColor('error'),
                    marginBottom: '4px'
                  }}>
                    {quizStats.incorrectAnswers}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted')
                  }}>
                    Incorrectas
                  </div>
                </div>

                <div style={{
                  background: safeColor('warning') + '20',
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${safeColor('warning')}33`
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: safeColor('warning'),
                    marginBottom: '4px'
                  }}>
                    {quizStats.accuracy}%
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted')
                  }}>
                    Precisión
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <div style={{
                display: 'flex',
                justifyContent: 'center'
              }}>
                <CustomButton
                  text="Volver al Dashboard"
                  onClick={onBack}
                  variant="primary"
                  style={{
                    fontSize: '1rem',
                    padding: '12px 24px'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryQuestionsPage;
