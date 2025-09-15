import React, { useState, useEffect, useCallback } from 'react';
import { getColor } from '../utils/constants';
import StudentCategoriesService from '../services/StudentCategoriesService';
import StudentsService from '../services/StudentsService';
import { supabase } from '../services/supabase';
import QuizProgressService from '../services/QuizProgressService';
import CustomButton from './CustomButton';
import QuizExplanationsView from './QuizExplanationsView';
import CustomModal from './CustomModal';
import useModal from '../hooks/useModal';

const CategoryQuestionsPage = ({ category, user, onBack, onStartQuiz }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Hook para manejar modales
  const { modalState, showSuccess, showError, showWarning, showInfo, showConfirm, hideModal } = useModal();
  const [studentAnswers, setStudentAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizStats, setQuizStats] = useState(null);
  const [, setSavingAnswers] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [quizPaused, setQuizPaused] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [explanationsEnabled, setExplanationsEnabled] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [quizMode, setQuizMode] = useState(true); // true = puede hacer quiz, false = solo explicaciones
  const [studentId, setStudentId] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({}); // Preguntas ya respondidas en modo estudio
  const [showAnswerFeedback, setShowAnswerFeedback] = useState({}); // Controla si mostrar feedback para cada pregunta
  const [showExplanation, setShowExplanation] = useState({}); // Controla si mostrar explicación para cada pregunta
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
      console.log('🔍 Cargando datos de categoría...', { categoryId: category.id, userId: user.id });
      
      // Obtener el ID del estudiante primero
      const { data: studentData, error: studentError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (studentError) {
        console.error('❌ Error obteniendo perfil del estudiante:', studentError);
        return;
      }
      
      const currentStudentId = studentData.id;
      setStudentId(currentStudentId);
      console.log('👤 Student ID obtenido:', currentStudentId);
      
      // Solo cargar estadísticas inicialmente, no las preguntas
      const statsData = await StudentCategoriesService.getCategoryStats(user.id, category.id);
      setStats(statsData);
      
      // Verificar si las explicaciones están habilitadas y el modo del quiz
      const explanationsStatus = await StudentCategoriesService.checkExplanationsEnabled(currentStudentId, category.id);
      setExplanationsEnabled(explanationsStatus);
      
      // Verificar el modo del quiz
      const { data: categoryData, error: categoryError } = await supabase
        .from('student_categories')
        .select('modo')
        .eq('student_id', currentStudentId)
        .eq('category_id', category.id)
        .single();
        
      console.log('📊 Datos de categoría obtenidos:', { categoryData, categoryError });
      
      if (!categoryError && categoryData) {
        const currentQuizMode = categoryData.modo !== false; // Default true si no está definido
        setQuizMode(currentQuizMode);
        console.log('📊 Modo del quiz:', currentQuizMode ? 'Puede hacer quiz' : 'Solo explicaciones');
        
        // Si modo = false, activar modo estudio interactivo (no mostrar explicaciones directamente)
        if (!currentQuizMode) {
          console.log('📚 Activando modo estudio interactivo');
          console.log('📚 Configurando quizStarted = true y quizStartTime');
          // Iniciar el quiz en modo estudio
          setQuizStarted(true);
          setQuizStartTime(new Date());
          // Las preguntas se cargarán automáticamente en el useEffect
        } else {
          console.log('🎮 Modo quiz activado, no iniciando automáticamente');
        }
      } else {
        console.log('⚠️ No se encontraron datos de categoría para el estudiante, usando modo quiz por defecto');
        setQuizMode(true); // Default a modo quiz
      }
      
      console.log('📊 Explicaciones habilitadas:', explanationsStatus);
    } catch (error) {
      console.error('❌ Error cargando datos de categoría:', error);
    } finally {
      setLoading(false);
    }
  }, [category?.id, user?.id]);

  const loadQuestions = useCallback(async () => {
    if (!category?.id || !user?.id) {
      console.log('⚠️ No se pueden cargar preguntas: category.id o user.id no disponible');
      return;
    }

    try {
      console.log('📚 Cargando preguntas para categoría:', category.id, 'usuario:', user.id);
      setLoading(true);
      const questionsData = await StudentCategoriesService.getCategoryQuestions(category.id, user.id);
      console.log('📚 Preguntas cargadas:', questionsData?.length || 0);
      if (questionsData && questionsData.length > 0) {
        console.log('📝 Primera pregunta:', questionsData[0].question.substring(0, 50) + '...');
      }
      setQuestions(questionsData);
    } catch (error) {
      console.error('❌ Error cargando preguntas:', error);
    } finally {
      setLoading(false);
    }
  }, [category?.id, user?.id]);

  // Cargar preguntas automáticamente cuando el modo estudio esté activado
  useEffect(() => {
    if (!quizMode && quizStarted && questions.length === 0) {
      console.log('📚 Modo estudio activado, cargando preguntas automáticamente...');
      loadQuestions();
    }
  }, [quizMode, quizStarted, questions.length, loadQuestions]);

  const handleStartQuiz = async () => {
    setQuizStarted(true);
    setQuizStartTime(new Date());
    await loadQuestions();
  };

  const pauseQuiz = async () => {
    try {
      console.log('⏸️ Pausando quiz...');
      
      // Verificar que user y category estén disponibles
      if (!user?.id || !category?.id) {
        console.error('❌ User o category no disponible para pausar quiz');
        showError('Error', 'No se puede pausar el quiz. Información de usuario o categoría no disponible.');
        return;
      }
      
      // Guardar progreso actual en la base de datos
      const result = await QuizProgressService.saveQuizProgress(
        user.id, // Usar user.id (auth.uid()) para consistencia con RLS
        category.id,
        currentQuestionIndex,
        questions?.length || 0
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('💾 Progreso del quiz guardado en base de datos');
      setQuizPaused(true);
      
      // Mostrar modal personalizado
      showInfo(
        'Quiz Pausado',
        'Tu progreso se ha guardado automáticamente. Puedes regresar cuando quieras para continuar desde donde te quedaste.',
        [
          {
            text: 'Continuar',
            variant: 'primary',
            onClick: () => {
              if (onBack) {
                onBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error pausando quiz:', error);
      showError(
        'Error',
        'No se pudo pausar el quiz. Por favor, intenta de nuevo.'
      );
    }
  };

  const resumeQuiz = () => {
    console.log('▶️ Reanudando quiz...');
    setQuizPaused(false);
    setQuizStarted(true);
  };

  const handleShowExplanation = (questionId) => {
    console.log('📚 Mostrando explicación para pregunta:', questionId);
    console.log('📚 Estado actual showAnswerFeedback antes:', showAnswerFeedback);
    
    setShowAnswerFeedback(prev => {
      const newState = {
        ...prev,
        [questionId]: true
      };
      console.log('📚 Nuevo estado showAnswerFeedback:', newState);
      return newState;
    });
    
    setShowExplanation(prev => {
      const newState = {
        ...prev,
        [questionId]: true
      };
      console.log('📚 Nuevo estado showExplanation:', newState);
      return newState;
    });
    
    // Forzar un re-render inmediato
    setTimeout(() => {
      console.log('📚 Estado showAnswerFeedback después del timeout:', showAnswerFeedback);
    }, 100);
  };

  const handleAnswerSelect = async (questionId, answer) => {
    console.log('🎯 handleAnswerSelect llamado:', { questionId, answer, quizMode });
    
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    console.log('✅ Respuesta seleccionada:', answer, 'para pregunta:', questionId);
    
    // En modo estudio, marcar la pregunta como respondida (pero no mostrar feedback aún)
    if (!quizMode) {
      console.log('📚 Modo estudio - marcando pregunta como respondida');
      setAnsweredQuestions(prev => {
        const newState = {
          ...prev,
          [questionId]: true
        };
        console.log('📚 Nuevo estado answeredQuestions:', newState);
        return newState;
      });
      return; // No mostrar modal en modo estudio
    }
    
    // Solo mostrar modal de confirmación en modo quiz
    // Verificar que questions esté disponible
    if (!questions || questions.length === 0) {
      console.warn('⚠️ Questions no disponible, saltando modal de confirmación');
      return;
    }
    
    // Mostrar mensaje de confirmación después de seleccionar respuesta (solo en modo quiz)
    const question = questions.find(q => q.id === questionId);
    const questionNumber = questions.findIndex(q => q.id === questionId) + 1;
    
    const confirmed = await new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 32px;
        max-width: 480px;
        width: 90%;
        text-align: center;
        color: white;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        position: relative;
        overflow: hidden;
      `;
      
      // Agregar efecto de brillo sutil
      const glow = document.createElement('div');
      glow.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
      `;
      content.appendChild(glow);
      
      content.innerHTML = `
        <div style="
          font-size: 64px; 
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3));
        ">✅</div>
        <h3 style="
          margin: 0 0 16px 0; 
          color: #ffffff; 
          font-size: 1.6rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        ">
          ¡Respuesta registrada!
        </h3>
        <p style="
          margin: 0 0 32px 0; 
          color: #e5e7eb; 
          font-size: 1.1rem;
          line-height: 1.5;
        ">
          Has respondido la pregunta <strong>${questionNumber}</strong> de <strong>${questions.length}</strong>.<br>
          ¿Qué deseas hacer ahora?
        </p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <button id="continue-btn" style="
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            min-width: 180px;
          ">
            Continuar con la siguiente
          </button>
          <button id="pause-btn" style="
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            min-width: 180px;
          ">
            Tomar un descanso
          </button>
        </div>
      `;
      
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      // Event listeners para los botones
      const continueBtn = content.querySelector('#continue-btn');
      const pauseBtn = content.querySelector('#pause-btn');
      
      continueBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve('continue');
      };
      
      pauseBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve('pause');
      };
      
      // Efectos hover mejorados
      continueBtn.onmouseenter = () => {
        continueBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)';
        continueBtn.style.transform = 'translateY(-2px)';
        continueBtn.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
      };
      continueBtn.onmouseleave = () => {
        continueBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
        continueBtn.style.transform = 'translateY(0)';
        continueBtn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
      };
      
      pauseBtn.onmouseenter = () => {
        pauseBtn.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
        pauseBtn.style.transform = 'translateY(-2px)';
        pauseBtn.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
      };
      pauseBtn.onmouseleave = () => {
        pauseBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        pauseBtn.style.transform = 'translateY(0)';
        pauseBtn.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
      };
    });
    
    if (confirmed === 'continue') {
      // Avanzar a la siguiente pregunta si no es la última
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } else if (confirmed === 'pause') {
      // Pausar el examen y guardar progreso
      await pauseQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setSavingAnswers(true);
      console.log('🚀 Iniciando envío del quiz...');
      
      // Calcular tiempo total del quiz
      const endTime = new Date();
      const startTime = quizStartTime || new Date(); // Fallback si no hay tiempo de inicio
      const totalTimeMs = endTime - startTime;
      const totalTimeMinutes = Math.round(totalTimeMs / 60000); // Convertir a minutos
      
      console.log('⏱️ Tiempo total del quiz:', totalTimeMinutes, 'minutos');
      
      // Guardar respuestas en la base de datos con tiempo
      await StudentCategoriesService.saveStudentAnswers(user.id, category.id, studentAnswers, totalTimeMinutes);
      
      // Calcular estadísticas
      const stats = await StudentCategoriesService.calculateQuizStats(user.id, category.id, studentAnswers);
      
      // Agregar información adicional a las estadísticas
      const enrichedStats = {
        ...stats,
        totalTimeMinutes: totalTimeMinutes,
        completedAt: new Date().toISOString(),
        categoryName: category?.name || 'Categoría'
      };
      
      setQuizStats(enrichedStats);
      
      setQuizCompleted(true);
      // Solo mostrar resultados si estamos en modo estudio (modo = false)
      // Si estamos en modo quiz (modo = true), solo regresar al dashboard
      if (!quizMode) {
        setShowResults(true); // Mostrar resultados y explicaciones solo en modo estudio
      }
      
      // Limpiar progreso guardado ya que el quiz está completado
      await QuizProgressService.clearQuizProgress(user.id, category.id);
      
      console.log('✅ Quiz completado y guardado:', stats);
      
      // Notificar al admin que se completó un quiz (para actualizar estadísticas)
      try {
        await StudentCategoriesService.notifyQuizCompletion(user.id, category.id, stats);
        console.log('📢 Notificación enviada al admin');
      } catch (notifyError) {
        console.warn('⚠️ Error notificando al admin:', notifyError);
        // No es crítico, continuar
      }
      
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
        maxScore: questions.length,
        totalTimeMinutes: 0, // No podemos calcular tiempo sin conexión
        completedAt: new Date().toISOString(),
        categoryName: category?.name || 'Categoría'
      };
      setQuizStats(localStats);
      setQuizCompleted(true);
      // Solo mostrar resultados si estamos en modo estudio (modo = false)
      if (!quizMode) {
        setShowResults(true); // Mostrar resultados incluso en caso de error, solo en modo estudio
      }
    } finally {
      setSavingAnswers(false);
    }
  };

  // const handleViewResults = () => {
  //   setShowResults(true);
  // };

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


  // Obtener studentId por email
  useEffect(() => {
    const loadStudentId = async () => {
      if (!user?.email) return;
      
      try {
        console.log('🔍 Obteniendo studentId para email:', user.email);
        const student = await StudentsService.getStudentByEmail(user.email);
        setStudentId(student.id);
        console.log('✅ StudentId obtenido:', student.id);
      } catch (error) {
        console.error('❌ Error obteniendo studentId:', error);
      }
    };

    loadStudentId();
  }, [user?.email]);

  useEffect(() => {
    loadCategoryData();
    
    // Verificar si hay progreso guardado para reanudar
    const checkSavedProgress = async () => {
      if (!user?.id || !category?.id) return;
      
      try {
        const result = await QuizProgressService.getQuizProgress(user.id, category.id);
        
        if (result.success && result.data && result.data.quiz_progress) {
          const progress = result.data.quiz_progress;
          console.log('🔍 Progreso guardado encontrado en base de datos:', progress);
          
          // Preguntar al usuario si quiere reanudar usando el nuevo sistema de modales
          const categoryName = category?.name || 'esta categoría';
          const currentQuestion = progress; // Ya viene como número de pregunta (1-based)
          
          showConfirm(
            '📚 Quiz Pausado',
            `Tienes un quiz pausado para "${categoryName}".\n\nProgreso: ${currentQuestion} de ${questions?.length || 0} preguntas.\n\n¿Quieres continuar desde donde te quedaste?`,
            () => {
              // Usuario quiere continuar
              console.log('✅ Reanudando quiz desde pregunta:', currentQuestion);
              setCurrentQuestionIndex(currentQuestion - 1); // Convertir a 0-based
              setQuizStarted(true);
              loadQuestions();
            },
            async () => {
              // Usuario no quiere continuar - limpiar progreso
              console.log('🗑️ Limpiando progreso guardado');
              await QuizProgressService.clearQuizProgress(user.id, category.id);
            },
            'Continuar Quiz',
            'Empezar Nuevo'
          );
        }
      } catch (error) {
        console.error('❌ Error cargando progreso guardado:', error);
      }
    };
    
    checkSavedProgress();
  }, [loadCategoryData, user?.id, category?.id, category?.name]);

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

  // const formatDate = (dateString) => {
  //   return new Date(dateString).toLocaleDateString('es-ES', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric'
  //   });
  // };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice': return '📝';
      case 'true_false': return '✅';
      case 'free_text': return '✍️';
      default: return '❓';
    }
  };

  // Efecto para regresar al dashboard cuando el quiz se completa en modo quiz
  useEffect(() => {
    if (quizCompleted && quizMode && !showResults) {
      console.log('🎯 Quiz completado en modo quiz, regresando al dashboard...');
      // Esperar un momento para mostrar el mensaje de completado
      const timer = setTimeout(() => {
        onBack();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [quizCompleted, quizMode, showResults, onBack]);

  const getQuestionTypeText = (type) => {
    switch (type) {
      case 'multiple_choice': return 'Opción Múltiple';
      case 'true_false': return 'Verdadero/Falso';
      case 'free_text': return 'Texto Libre';
      default: return 'Desconocido';
    }
  };

  // Log del estado actual para debugging
  console.log('🔍 Estado actual del componente:', {
    quizMode,
    quizStarted,
    quizCompleted,
    showExplanations,
    explanationsEnabled,
    loading,
    questionsCount: questions.length,
    currentQuestionIndex,
    studentId,
    showAnswerFeedback,
    answeredQuestions
  });
  
  // Log específico para debugging del feedback
  if (questions.length > 0) {
    console.log('🎯 Estado del feedback para la primera pregunta:', {
      questionId: questions[0].id,
      showAnswerFeedback: showAnswerFeedback[questions[0].id],
      answeredQuestions: answeredQuestions[questions[0].id],
      correctAnswer: questions[0].correct_answer
    });
    
    // Log más detallado
    console.log('🎯 showAnswerFeedback completo:', showAnswerFeedback);
    console.log('🎯 answeredQuestions completo:', answeredQuestions);
  }

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

  // Si estamos mostrando las explicaciones, renderizar el componente de explicaciones
  // En modo estudio, no mostrar explicaciones automáticamente
  if (showExplanations && quizCompleted && explanationsEnabled && quizMode) {
    return (
      <QuizExplanationsView
        category={category}
        user={user}
        studentAnswers={studentAnswers}
        onBack={() => setShowExplanations(false)}
      />
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


          {/* Start Quiz Button */}
          {questions.length > 0 && !quizCompleted && (
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
          {!quizStarted && !quizCompleted ? (
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

                        {/* Imagen si está disponible - Antes de la pregunta */}
                        {question.image_url && (
                          <div style={{
                            marginBottom: '20px',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              position: 'relative',
                              display: 'inline-block',
                              cursor: 'pointer',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: `1px solid ${safeColor('border')}`,
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => {
                              // Crear modal para ampliar imagen
                              const modal = document.createElement('div');
                              modal.id = 'image-modal';
                              modal.style.cssText = `
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: rgba(0, 0, 0, 0.95);
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                z-index: 10000;
                                cursor: pointer;
                                backdrop-filter: blur(8px);
                              `;
                              
                              const img = document.createElement('img');
                              img.src = question.image_url;
                              img.style.cssText = `
                                max-width: 90%;
                                max-height: 90%;
                                object-fit: contain;
                                border-radius: 12px;
                                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
                                border: 2px solid rgba(255, 255, 255, 0.1);
                                transition: transform 0.3s ease;
                              `;
                              
                              const closeBtn = document.createElement('div');
                              closeBtn.innerHTML = '✕';
                              closeBtn.style.cssText = `
                                position: absolute;
                                top: 20px;
                                right: 30px;
                                color: white;
                                font-size: 24px;
                                font-weight: bold;
                                cursor: pointer;
                                background: rgba(0, 0, 0, 0.7);
                                width: 44px;
                                height: 44px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.3s ease;
                                border: 2px solid rgba(255, 255, 255, 0.2);
                                backdrop-filter: blur(4px);
                              `;
                              closeBtn.onmouseover = () => {
                                closeBtn.style.background = 'rgba(239, 68, 68, 0.8)';
                                closeBtn.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                                closeBtn.style.transform = 'scale(1.1)';
                              };
                              closeBtn.onmouseout = () => {
                                closeBtn.style.background = 'rgba(0, 0, 0, 0.7)';
                                closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                closeBtn.style.transform = 'scale(1)';
                              };
                              
                              modal.appendChild(img);
                              modal.appendChild(closeBtn);
                              document.body.appendChild(modal);
                              
                              const closeModal = () => {
                                const existingModal = document.getElementById('image-modal');
                                if (existingModal && existingModal.parentNode) {
                                  existingModal.parentNode.removeChild(existingModal);
                                }
                              };
                              
                              closeBtn.onclick = closeModal;
                              modal.onclick = closeModal;
                              img.onclick = (e) => e.stopPropagation();
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.02)';
                              e.target.style.boxShadow = `0 4px 15px ${safeColor('primary')}40`;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = 'none';
                            }}>
                              <img
                                src={question.image_url}
                                alt="Imagen de la pregunta"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '200px',
                                  display: 'block',
                                  transition: 'all 0.3s ease'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Pregunta */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                          <h4 style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: safeColor('textPrimary'),
                            margin: 0,
                            lineHeight: '1.4',
                            flex: 1
                          }}>
                            {question.question}
                          </h4>
                          {/* Indicador de pregunta respondida en modo estudio */}
                          {!quizMode && answeredQuestions[question.id] && (
                            <div style={{
                              background: showAnswerFeedback[question.id] 
                                ? safeColor('success') + '20' 
                                : safeColor('primary') + '20',
                              color: showAnswerFeedback[question.id] 
                                ? safeColor('success') 
                                : safeColor('primary'),
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              border: `1px solid ${showAnswerFeedback[question.id] 
                                ? safeColor('success') + '40' 
                                : safeColor('primary') + '40'}`
                            }}>
                              {showAnswerFeedback[question.id] ? '✅ Completada' : '⏳ Respondida'}
                            </div>
                          )}
                        </div>


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
                                // Comparar con el texto completo de la opción, no con la letra
                                const isCorrect = question.correct_answer === option;
                                
                                // En modo estudio, solo mostrar feedback después de hacer clic en "Ver explicación"
                                // En modo quiz, mostrar feedback solo al final
                                const showCorrect = (!quizMode && showAnswerFeedback[question.id] && isCorrect) || 
                                                   (quizMode && showResults && isCorrect);
                                const showIncorrect = (!quizMode && showAnswerFeedback[question.id] && isSelected && !isCorrect) || 
                                                      (quizMode && showResults && isSelected && !isCorrect);
                                
                                // En modo estudio, SIEMPRE mostrar la respuesta correcta cuando se muestra el feedback
                                const shouldShowCorrect = (!quizMode && showAnswerFeedback[question.id] && isCorrect) || 
                                                         (quizMode && showResults && isCorrect);
                                
                                // FORZAR mostrar la respuesta correcta si estamos en modo estudio y se ha mostrado la explicación
                                const forceShowCorrect = !quizMode && showAnswerFeedback[question.id] && isCorrect;
                                
                                // Debug logs para la primera pregunta
                                if (question.id === questions[0]?.id) {
                                  console.log('🎯 Debug opción', optionKey, ':', {
                                    isSelected,
                                    isCorrect,
                                    showAnswerFeedback: showAnswerFeedback[question.id],
                                    showCorrect,
                                    shouldShowCorrect,
                                    forceShowCorrect,
                                    showIncorrect,
                                    quizMode,
                                    showResults,
                                    questionId: question.id,
                                    correctAnswer: question.correct_answer
                                  });
                                }
                                
                                return (
                                  <button
                                    key={optIndex}
                                    onClick={() => {
                                      console.log('🖱️ Botón clickeado:', { 
                                        questionId: question.id, 
                                        optionKey, 
                                        quizMode, 
                                        answered: answeredQuestions[question.id],
                                        showResults 
                                      });
                                      
                                      // En modo estudio, solo permitir responder si no ha respondido aún
                                      // En modo quiz, solo permitir si no se han mostrado resultados
                                      if (!quizMode && !answeredQuestions[question.id]) {
                                        console.log('📚 Modo estudio - permitiendo respuesta');
                                        handleAnswerSelect(question.id, optionKey);
                                      } else if (quizMode && !showResults) {
                                        console.log('🎮 Modo quiz - permitiendo respuesta');
                                        handleAnswerSelect(question.id, optionKey);
                                      } else {
                                        console.log('❌ Respuesta bloqueada');
                                      }
                                    }}
                                    disabled={(quizMode && showResults) || (!quizMode && answeredQuestions[question.id])}
                                    style={{
                                      padding: '16px 20px',
                                      background: forceShowCorrect 
                                        ? safeColor('success') + '20' 
                                        : showIncorrect 
                                          ? safeColor('error') + '20'
                                          : isSelected 
                                            ? safeColor('primary') + '20'
                                            : safeColor('cardBg'),
                                      borderRadius: '12px',
                                      border: `2px solid ${
                                        forceShowCorrect 
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
                                    {forceShowCorrect && <span style={{ color: safeColor('success'), fontSize: '1.2rem' }}>✓</span>}
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

                        {/* Botón "Ver explicación" en modo estudio */}
                        {!quizMode && answeredQuestions[question.id] && !showAnswerFeedback[question.id] && (
                          <div style={{
                            marginTop: '20px',
                            textAlign: 'center'
                          }}>
                            <button
                              onClick={() => handleShowExplanation(question.id)}
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                              }}
                            >
                              📚 Ver explicación
                            </button>
                          </div>
                        )}

                        {/* Explicación - Se muestra después de hacer clic en "Ver explicación" en modo estudio o al final en modo quiz */}
                        {question.explanation && (
                          (!quizMode && showAnswerFeedback[question.id]) || 
                          (quizMode && showResults)
                        ) && (
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

                        {/* Botón "Siguiente pregunta" en modo estudio después de ver explicación */}
                        {!quizMode && showAnswerFeedback[question.id] && currentQuestionIndex < questions.length - 1 && (
                          <div style={{
                            marginTop: '20px',
                            textAlign: 'center'
                          }}>
                            <button
                              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                              }}
                            >
                              ➡️ Siguiente pregunta
                            </button>
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
                padding: '12px',
                background: safeColor('cardBg'),
                borderRadius: '8px',
                border: `1px solid ${safeColor('border')}33`
              }}>
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={{
                    background: currentQuestionIndex === 0 ? safeColor('border') : safeColor('primary'),
                    color: currentQuestionIndex === 0 ? safeColor('textMuted') : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '14px',
                    cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: currentQuestionIndex === 0 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentQuestionIndex > 0) {
                      e.target.style.background = safeColor('primaryHover');
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentQuestionIndex > 0) {
                      e.target.style.background = safeColor('primary');
                    }
                  }}
                >
                  ←
                </button>
                
                <div style={{
                  fontSize: '0.8rem',
                  color: safeColor('textMuted'),
                  fontWeight: '500'
                }}>
                  {currentQuestionIndex + 1} / {questions.length}
                </div>
                
                <button
                  onClick={currentQuestionIndex === questions.length - 1 ? handleSubmitQuiz : nextQuestion}
                  style={{
                    background: currentQuestionIndex === questions.length - 1 ? safeColor('success') : safeColor('primary'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = currentQuestionIndex === questions.length - 1 ? safeColor('successHover') : safeColor('primaryHover');
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = currentQuestionIndex === questions.length - 1 ? safeColor('success') : safeColor('primary');
                  }}
                >
                  {currentQuestionIndex === questions.length - 1 ? "✓" : "→"}
                </button>
              </div>
            </div>
          )}

          {/* Mensaje de Quiz Completado - Solo en modo quiz */}
          {quizCompleted && quizMode && (
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
                margin: '0 0 24px 0'
              }}>
                Has terminado el quiz de {category?.name || 'esta categoría'}.<br/>
                Regresando al dashboard...
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                color: safeColor('textMuted')
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${safeColor('primary')}`,
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Cargando...</span>
              </div>
            </div>
          )}

          {/* Resultados del Quiz Completado - Solo en modo estudio */}
          {quizCompleted && quizStats && !quizMode && (
            <div style={{
              background: safeColor('cardBg'),
              borderRadius: '16px',
              padding: '32px',
              marginTop: '24px',
              border: `1px solid ${safeColor('border')}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>
                {explanationsEnabled ? '🎉' : '⏳'}
              </div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: safeColor('textPrimary'),
                margin: '0 0 16px 0'
              }}>
                {explanationsEnabled ? '¡Quiz Completado!' : 'Quiz Completado'}
              </h2>
              {!explanationsEnabled && (
                <div style={{
                  background: safeColor('warning') + '20',
                  border: `1px solid ${safeColor('warning')}40`,
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  color: safeColor('warning')
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                    color: safeColor('warning')
                  }}>
                    Explicaciones Pendientes
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    margin: '0',
                    color: safeColor('textMuted'),
                    lineHeight: '1.5'
                  }}>
                    Tu quiz ha sido completado exitosamente. El administrador revisará tus respuestas 
                    y habilitará las explicaciones cuando esté listo. Podrás ver tus resultados 
                    y las explicaciones una vez que estén disponibles.
                  </p>
                </div>
              )}
              <p style={{
                fontSize: '1.1rem',
                color: safeColor('textMuted'),
                margin: '0 0 32px 0'
              }}>
                Has terminado el quiz de {category?.name || 'esta categoría'}
              </p>


              {/* Botones de acción */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap'
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
      
      {/* Modal personalizado */}
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        buttons={modalState.buttons}
        showCloseButton={modalState.showCloseButton}
      />
    </div>
  );
};

export default CategoryQuestionsPage;

