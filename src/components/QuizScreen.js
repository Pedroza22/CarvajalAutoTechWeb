import React, { useState, useEffect, useRef } from 'react';
import { AppConstants } from '../utils/constants';
import CustomButton from './CustomButton';
import { questionsService } from '../services/QuestionsService';
import { studentAnswerService } from '../services/StudentAnswerService';

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

const QuizScreen = ({ categoryId, onFinish, onExit }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [freeTextAnswer, setFreeTextAnswer] = useState('');
  
  const timerRef = useRef(null);

  useEffect(() => {
    loadQuestions();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [categoryId]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await questionsService.getQuestionsByCategory(categoryId);
      if (response.success) {
        setQuestions(response.data);
        if (response.data.length > 0) {
          setQuestionStartTime(Date.now());
        }
      } else {
        console.error('Error cargando preguntas:', response.error);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error cargando preguntas:', error);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / questions.length;
  const timeRemaining = currentQuestion?.timeLimit || 30;

  const handleAnswer = async (answer) => {
    if (isAnswered) return;

    setIsAnswered(true);
    const question = currentQuestion;
    const elapsed = questionStartTime ? (Date.now() - questionStartTime) / 1000 : 0;
    const isCorrect = answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    try {
      await studentAnswerService.saveAnswer({
        questionId: question.id,
        answer: answer,
        isCorrect: isCorrect,
        timeSpent: elapsed
      });
    } catch (error) {
      console.error('Error guardando respuesta:', error);
    }

    setAnswers(prev => ({
      ...prev,
      [question.id]: { answer, isCorrect, timeSpent: elapsed }
    }));

    // Avanzar a la siguiente pregunta después de un delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnswered(false);
        setQuestionStartTime(Date.now());
        setFreeTextAnswer('');
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const finishQuiz = () => {
    const results = {
      totalQuestions: questions.length,
      correctAnswers: Object.values(answers).filter(a => a.isCorrect).length,
      incorrectAnswers: Object.values(answers).filter(a => !a.isCorrect).length,
      accuracy: (Object.values(answers).filter(a => a.isCorrect).length / questions.length) * 100,
      questions: questions.map(q => ({
        ...q,
        userAnswer: answers[q.id]?.answer || '',
        isCorrect: answers[q.id]?.isCorrect || false,
        timeSpent: answers[q.id]?.timeSpent || 0
      }))
    };
    onFinish(results);
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'multipleChoice': return safeColor('primary');
      case 'trueFalse': return safeColor('warning');
      case 'freeText': return safeColor('success');
      default: return safeColor('primary');
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multipleChoice': return '📝';
      case 'trueFalse': return '✅';
      case 'freeText': return '✍️';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: safeColor('dark')
      }}>
        <div style={{ color: safeColor('primary'), fontSize: '18px' }}>
          Cargando preguntas...
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: safeColor('dark'),
        color: safeColor('textPrimary')
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>No hay preguntas disponibles</h2>
          <CustomButton
            text="Volver"
            onClick={onExit}
            icon="←"
          />
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
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: 0
          }}>
            Quiz - Pregunta {currentQuestionIndex + 1} de {questions.length}
          </h1>
          <CustomButton
            onClick={onExit}
            text="Salir"
            variant="secondary"
            size="small"
            icon="🚪"
            fullWidth={false}
            style={{
              background: `${safeColor('secondary')}20`,
              border: `1px solid ${safeColor('secondary')}40`,
              color: safeColor('secondary')
            }}
          />
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
            background: safeColor('primary'),
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Timer */}
        {timeRemaining > 0 && (
          <div style={{
            background: `linear-gradient(135deg, ${timeRemaining <= 10 ? safeColor('error') : safeColor('primary')}, ${timeRemaining <= 10 ? safeColor('error') + 'CC' : safeColor('primary') + 'CC'})`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: `0 6px 12px ${timeRemaining <= 10 ? safeColor('error') + '4D' : safeColor('primary') + '4D'}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>⏰</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>
                  Tiempo restante
                </span>
              </div>
              <div style={{
                background: `${safeColor('textPrimary')}33`,
                borderRadius: '12px',
                padding: '8px 16px'
              }}>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {timeRemaining}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${safeColor('border')}4D`
        }}>
          {/* Tipo */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: `${getQuestionTypeColor(currentQuestion.type)}20`,
            color: getQuestionTypeColor(currentQuestion.type),
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            <span style={{ marginRight: '8px' }}>
              {getQuestionTypeIcon(currentQuestion.type)}
            </span>
            {currentQuestion.type === 'multipleChoice' ? 'Opción Múltiple' :
             currentQuestion.type === 'trueFalse' ? 'Verdadero/Falso' :
             currentQuestion.type === 'freeText' ? 'Respuesta Libre' : 'Pregunta'}
          </div>

          {/* Pregunta */}
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '24px',
            lineHeight: 1.4
          }}>
            {currentQuestion.text}
          </h2>

          {/* Opciones de respuesta */}
          <div style={{ marginBottom: '24px' }}>
            {currentQuestion.type === 'multipleChoice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion.id]?.answer === option;
                  return (
                    <button
                      key={index}
                      onClick={() => !isAnswered && handleAnswer(option)}
                      disabled={isAnswered}
                      style={{
                        padding: '16px 20px',
                        background: isSelected ? `${safeColor('primary')}33` : safeColor('cardBg'),
                        border: `2px solid ${isSelected ? safeColor('primary') : safeColor('border') + '80'}`,
                        borderRadius: '12px',
                        color: safeColor('textPrimary'),
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: isAnswered ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: isAnswered ? 0.7 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? safeColor('primary') : safeColor('border') + '80'}`,
                          background: isSelected ? safeColor('primary') : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px'
                        }}>
                          {isSelected && <span style={{ color: safeColor('textPrimary'), fontSize: '16px' }}>✓</span>}
                        </div>
                        <span style={{
                          fontSize: '1.125rem',
                          fontWeight: '500'
                        }}>
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'trueFalse' && (
              <div style={{ display: 'flex', gap: '16px' }}>
                {['Verdadero', 'Falso'].map((option) => {
                  const isSelected = answers[currentQuestion.id]?.answer === option;
                  return (
                    <button
                      key={option}
                      onClick={() => !isAnswered && handleAnswer(option)}
                      disabled={isAnswered}
                      style={{
                        flex: 1,
                        padding: '24px',
                        background: isSelected ? `${safeColor('primary')}33` : safeColor('cardBg'),
                        border: `2px solid ${isSelected ? safeColor('primary') : safeColor('border') + '80'}`,
                        borderRadius: '16px',
                        color: safeColor('textPrimary'),
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        cursor: isAnswered ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        opacity: isAnswered ? 0.7 : 1
                      }}
                    >
                      <div style={{
                        fontSize: '40px',
                        marginBottom: '12px',
                        color: isSelected ? safeColor('primary') : safeColor('border') + '80'
                      }}>
                        {option === 'Verdadero' ? '✓' : '✗'}
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '600'
                      }}>
                        {option}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'freeText' && (
              <div>
                <textarea
                  value={freeTextAnswer}
                  onChange={(e) => setFreeTextAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    background: safeColor('cardBg'),
                    border: `1px solid ${safeColor('border')}80`,
                    borderRadius: '12px',
                    padding: '20px',
                    color: safeColor('textPrimary'),
                    fontSize: '18px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <CustomButton
                    text="Enviar Respuesta"
                    onClick={() => {
                      if (freeTextAnswer.trim()) {
                        handleAnswer(freeTextAnswer.trim());
                      }
                    }}
                    disabled={!freeTextAnswer.trim()}
                    style={{
                      background: `linear-gradient(135deg, ${safeColor('primary')}, ${safeColor('primary')}CC)`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;