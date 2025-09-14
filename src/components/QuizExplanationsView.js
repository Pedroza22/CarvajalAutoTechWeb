import React, { useState, useEffect } from 'react';
import { getColor } from '../utils/constants';
import { supabase } from '../services/supabase';

const QuizExplanationsView = ({ category, user, studentAnswers, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  useEffect(() => {
    loadQuestions();
  }, [category?.id]);

  const loadQuestions = async () => {
    if (!category?.id || !user?.id) return;

    try {
      setLoading(true);
      // Cargar las preguntas del quiz completado
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select(`
          id,
          question,
          options,
          correct_answer,
          explanation,
          image_url
        `)
        .eq('category_id', category.id)
        .order('id');

      if (error) {
        console.error('❌ Error cargando preguntas:', error);
        return;
      }

      setQuestions(questionsData || []);
    } catch (error) {
      console.error('❌ Error cargando preguntas:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getOptionStyle = (optionKey, question) => {
    const studentAnswer = studentAnswers[question.id];
    const isCorrect = optionKey === question.correct_answer;
    const isStudentAnswer = optionKey === studentAnswer;

    if (isCorrect) {
      return {
        background: safeColor('success') + '20',
        border: `2px solid ${safeColor('success')}`,
        color: safeColor('success')
      };
    } else if (isStudentAnswer && !isCorrect) {
      return {
        background: safeColor('error') + '20',
        border: `2px solid ${safeColor('error')}`,
        color: safeColor('error')
      };
    } else {
      return {
        background: safeColor('cardBg'),
        border: `1px solid ${safeColor('border')}`,
        color: safeColor('textPrimary')
      };
    }
  };

  const getOptionIcon = (optionKey, question) => {
    const studentAnswer = studentAnswers[question.id];
    const isCorrect = optionKey === question.correct_answer;
    const isStudentAnswer = optionKey === studentAnswer;

    if (isCorrect) {
      return '✅';
    } else if (isStudentAnswer && !isCorrect) {
      return '❌';
    } else {
      return '';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: safeColor('textPrimary')
      }}>
        <div>Cargando explicaciones...</div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: safeColor('textMuted')
      }}>
        <h3>No hay preguntas disponibles</h3>
        <p>No se encontraron preguntas para este quiz.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: `1px solid ${safeColor('border')}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: `1px solid ${safeColor('border')}`,
              color: safeColor('textPrimary'),
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Volver
          </button>
          <h2 style={{
            color: safeColor('textPrimary'),
            margin: 0,
            fontSize: '1.5rem'
          }}>
            Explicaciones - {category?.name}
          </h2>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            style={{
              background: currentQuestionIndex === 0 ? safeColor('border') : safeColor('primary'),
              color: currentQuestionIndex === 0 ? safeColor('textMuted') : 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.9rem',
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQuestionIndex === 0 ? 0.5 : 1
            }}
          >
            ← Anterior
          </button>
          
          <div style={{
            fontSize: '1rem',
            color: safeColor('textPrimary'),
            fontWeight: '600'
          }}>
            {currentQuestionIndex + 1} de {questions.length}
          </div>
          
          <button
            onClick={nextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            style={{
              background: currentQuestionIndex === questions.length - 1 ? safeColor('border') : safeColor('primary'),
              color: currentQuestionIndex === questions.length - 1 ? safeColor('textMuted') : 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.9rem',
              cursor: currentQuestionIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentQuestionIndex === questions.length - 1 ? 0.5 : 1
            }}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        border: `1px solid ${safeColor('border')}`
      }}>
        {/* Imagen si está disponible */}
        {currentQuestion.image_url && (
          <div style={{
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <img
              src={currentQuestion.image_url}
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

        {/* Pregunta */}
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: safeColor('textPrimary'),
          margin: '0 0 24px 0',
          lineHeight: '1.4'
        }}>
          {currentQuestion.question}
        </h3>

        {/* Opciones */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: '0 0 16px 0'
          }}>
            Selecciona tu respuesta:
          </p>
          
          {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, option]) => (
            <div
              key={key}
              style={{
                ...getOptionStyle(key, currentQuestion),
                padding: '16px',
                marginBottom: '12px',
                borderRadius: '8px',
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>
                {getOptionIcon(key, currentQuestion)}
              </span>
              <span style={{ fontWeight: '600', minWidth: '30px' }}>
                {key}.
              </span>
              <span>{option}</span>
            </div>
          ))}
        </div>

        {/* Explicación */}
        {currentQuestion.explanation && (
          <div style={{
            background: safeColor('success') + '20',
            border: `1px solid ${safeColor('success')}33`,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: safeColor('success'),
                margin: 0
              }}>
                Explicación:
              </h4>
            </div>
            <p style={{
              fontSize: '1rem',
              color: safeColor('textPrimary'),
              margin: 0,
              lineHeight: '1.5'
            }}>
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizExplanationsView;
