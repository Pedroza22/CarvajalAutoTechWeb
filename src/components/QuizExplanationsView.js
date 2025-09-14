import React, { useState, useEffect, useMemo } from 'react';
import { getColor } from '../utils/constants';
import { supabase } from '../services/supabase';

const QuizExplanationsView = ({ category, user, studentAnswers, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadedStudentAnswers, setLoadedStudentAnswers] = useState({});
  const [orderedQuestionIds, setOrderedQuestionIds] = useState([]);

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  useEffect(() => {
    loadQuestions();
  }, [category?.id, user?.id]);

  useEffect(() => {
    if (questions.length > 0) {
      loadStudentAnswers();
    }
  }, [questions]);

  // Ordenar las preguntas para mantener el mismo orden que en el quiz
  const sortedQuestions = useMemo(() => {
    if (!questions || !loadedStudentAnswers || !orderedQuestionIds.length) return questions;
    
    // Usar el orden cronológico de las respuestas para ordenar las preguntas
    const sortedQuestions = orderedQuestionIds.map(questionId => 
      questions.find(q => q.id === questionId)
    ).filter(Boolean);
    
    console.log('📋 Preguntas ordenadas:', sortedQuestions.length);
    console.log('📋 IDs ordenados (cronológico):', orderedQuestionIds);
    return sortedQuestions;
  }, [questions, loadedStudentAnswers, orderedQuestionIds]);

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
        .eq('category_id', category.id);

      if (error) {
        console.error('❌ Error cargando preguntas:', error);
        return;
      }

      console.log('✅ Preguntas cargadas:', questionsData?.length || 0);
      console.log('📋 IDs de preguntas cargadas:', questionsData?.map(q => q.id) || []);
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('❌ Error cargando preguntas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAnswers = async () => {
    if (!category?.id || !user?.id) return;

    try {
      console.log('🔍 Cargando respuestas del estudiante para explicaciones...');
      
      // Cargar las respuestas del estudiante desde la base de datos en el orden que fueron respondidas
      const { data: answersData, error } = await supabase
        .from('student_answers')
        .select(`
          question_id,
          answer,
          answered_at
        `)
        .eq('student_id', user.id)
        .in('question_id', questions.map(q => q.id))
        .order('answered_at', { ascending: true });

      if (error) {
        console.error('❌ Error cargando respuestas del estudiante:', error);
        return;
      }

      // Convertir a objeto con question_id como clave y mantener el orden
      const answersMap = {};
      const orderedQuestionIds = [];
      
      answersData?.forEach(answer => {
        answersMap[answer.question_id] = answer.answer;
        orderedQuestionIds.push(answer.question_id);
      });

      console.log('✅ Respuestas del estudiante cargadas:', Object.keys(answersMap).length);
      console.log('📋 IDs de preguntas con respuestas (orden cronológico):', orderedQuestionIds);
      setLoadedStudentAnswers(answersMap);
      setOrderedQuestionIds(orderedQuestionIds);
    } catch (error) {
      console.error('❌ Error cargando respuestas del estudiante:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < sortedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getOptionStyle = (optionKey, question) => {
    // Usar las respuestas cargadas desde la base de datos, o las pasadas como prop como fallback
    const studentAnswer = loadedStudentAnswers[question.id] || studentAnswers[question.id];
    
    // Convertir optionKey a letra si viene como número o string numérico
    let optionLetter;
    if (typeof optionKey === 'number') {
      optionLetter = String.fromCharCode(65 + optionKey);
    } else if (typeof optionKey === 'string' && /^\d+$/.test(optionKey)) {
      // Si es un string que contiene solo dígitos, convertir a número y luego a letra
      optionLetter = String.fromCharCode(65 + parseInt(optionKey));
    } else {
      optionLetter = optionKey;
    }
    
    // Determinar si esta opción es la correcta
    let isCorrect = false;
    if (['A', 'B', 'C', 'D'].includes(question.correct_answer)) {
      // Si correct_answer es una letra, comparar directamente
      isCorrect = optionLetter === question.correct_answer;
    } else {
      // Si correct_answer es texto completo, encontrar el índice correspondiente
      const correctIndex = question.options.indexOf(question.correct_answer);
      if (correctIndex !== -1) {
        const correctOptionKey = String.fromCharCode(65 + correctIndex);
        isCorrect = optionLetter === correctOptionKey;
      }
    }
    
    const isStudentAnswer = optionLetter === studentAnswer;

    // Debug temporal para resaltado
    console.log(`🎯 RESALTADO - Pregunta ${question.id.substring(0,8)}... Opción ${optionLetter}:`, {
      isCorrect,
      isStudentAnswer,
      studentAnswer,
      correctAnswer: question.correct_answer,
      optionLetter,
      questionOptions: question.options
    });

    let style;
    if (isCorrect) {
      style = {
        background: safeColor('success') + '20',
        border: `2px solid ${safeColor('success')}`,
        color: safeColor('success')
      };
      console.log(`✅ APLICANDO ESTILO VERDE para opción ${optionLetter}`);
    } else if (isStudentAnswer && !isCorrect) {
      style = {
        background: safeColor('error') + '20',
        border: `2px solid ${safeColor('error')}`,
        color: safeColor('error')
      };
      console.log(`❌ APLICANDO ESTILO ROJO para opción ${optionLetter}`);
    } else {
      style = {
        background: safeColor('cardBg'),
        border: `1px solid ${safeColor('border')}`,
        color: safeColor('textPrimary')
      };
      console.log(`⚪ APLICANDO ESTILO NORMAL para opción ${optionLetter}`);
    }
    
    return style;
  };

  const getOptionIcon = (optionKey, question) => {
    // Usar las respuestas cargadas desde la base de datos, o las pasadas como prop como fallback
    const studentAnswer = loadedStudentAnswers[question.id] || studentAnswers[question.id];
    
    // Convertir optionKey a letra si viene como número o string numérico
    let optionLetter;
    if (typeof optionKey === 'number') {
      optionLetter = String.fromCharCode(65 + optionKey);
    } else if (typeof optionKey === 'string' && /^\d+$/.test(optionKey)) {
      // Si es un string que contiene solo dígitos, convertir a número y luego a letra
      optionLetter = String.fromCharCode(65 + parseInt(optionKey));
    } else {
      optionLetter = optionKey;
    }
    
    // Determinar si esta opción es la correcta
    let isCorrect = false;
    if (['A', 'B', 'C', 'D'].includes(question.correct_answer)) {
      // Si correct_answer es una letra, comparar directamente
      isCorrect = optionLetter === question.correct_answer;
    } else {
      // Si correct_answer es texto completo, encontrar el índice correspondiente
      const correctIndex = question.options.indexOf(question.correct_answer);
      if (correctIndex !== -1) {
        const correctOptionKey = String.fromCharCode(65 + correctIndex);
        isCorrect = optionLetter === correctOptionKey;
      }
    }
    
    const isStudentAnswer = optionLetter === studentAnswer;

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

  if (!sortedQuestions.length) {
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

  const currentQuestion = sortedQuestions[currentQuestionIndex];

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
            {currentQuestionIndex + 1} de {sortedQuestions.length}
          </div>
          
          <button
            onClick={nextQuestion}
            disabled={currentQuestionIndex === sortedQuestions.length - 1}
            style={{
              background: currentQuestionIndex === sortedQuestions.length - 1 ? safeColor('border') : safeColor('primary'),
              color: currentQuestionIndex === sortedQuestions.length - 1 ? safeColor('textMuted') : 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.9rem',
              cursor: currentQuestionIndex === sortedQuestions.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentQuestionIndex === sortedQuestions.length - 1 ? 0.5 : 1
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
