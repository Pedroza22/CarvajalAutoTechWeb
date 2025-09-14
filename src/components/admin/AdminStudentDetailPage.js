import React, { useState, useEffect, useCallback } from 'react';
import { getColor } from '../../utils/constants';
import StudentsService from '../../services/StudentsService';
import StudentCategoriesService from '../../services/StudentCategoriesService';
import ExplanationsService from '../../services/ExplanationsService';
import { supabase } from '../../services/supabase';
import useModal from '../../hooks/useModal';
import CustomModal from '../CustomModal';

const AdminStudentDetailPage = ({ onNavigate, student }) => {
  console.log('🔍 AdminStudentDetailPage recibió student:', student);
  
  const [studentData, setStudentData] = useState(student || {});
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quizzes');
  const [categoryExplanations, setCategoryExplanations] = useState({});
  const [connectionError, setConnectionError] = useState(false);
  const { modalState, showModal, hideModal, showSuccess, showError, showConfirm } = useModal();

  const loadStudentDetail = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando detalle del estudiante:', student.id);
      
      // Usar el método existente getStudentDetail con retry
      let detailData;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          detailData = await StudentsService.getStudentDetail(student.id);
          break; // Si funciona, salir del bucle
        } catch (error) {
          retries++;
          console.warn(`⚠️ Intento ${retries} falló, reintentando...`, error.message);
          
          if (retries >= maxRetries) {
            throw error; // Si se agotaron los reintentos, lanzar el error
          }
          
          // Esperar antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      // Mantener la información que ya tenemos del estudiante
      const enrichedData = {
        ...student, // Información básica que ya tenemos
        ...detailData, // Datos detallados de la base de datos
        // Calcular tiempo total estimado (aproximado basado en respuestas)
        totalTimeSpent: detailData.totalAnswers ? detailData.totalAnswers * 2 : 0, // 2 min por pregunta estimado
        // Generar fortalezas y debilidades basadas en el rendimiento
        strengths: detailData.categoryStats?.filter(cat => cat.accuracy >= 70).map(cat => cat.categoryName) || ['Matemáticas', 'Ciencias'],
        weaknesses: detailData.categoryStats?.filter(cat => cat.accuracy < 50).map(cat => cat.categoryName) || ['Historia'],
        // Generar logros básicos
        achievements: [
          ...(detailData.totalAnswers > 0 ? [{ 
            name: 'Primer Quiz Completado', 
            date: detailData.lastActivity || new Date().toISOString(), 
            description: 'Completó su primer quiz exitosamente' 
          }] : []),
          ...(detailData.totalAnswers >= 10 ? [{ 
            name: 'Estudiante Activo', 
            date: detailData.lastActivity || new Date().toISOString(), 
            description: 'Ha completado múltiples quizzes' 
          }] : []),
          ...(detailData.overallAccuracy >= 80 ? [{ 
            name: 'Excelente Rendimiento', 
            date: detailData.lastActivity || new Date().toISOString(), 
            description: 'Mantiene un alto nivel de precisión' 
          }] : [])
        ]
      };
      
      setStudentData(enrichedData);
      setConnectionError(false); // Resetear error de conexión
      
      // Generar historial de quizzes basado en las categorías con datos reales
      const quizHistoryData = detailData.categoryStats?.map((category, index) => ({
        id: index + 1,
        quizName: `Quiz de ${category.categoryName}`,
        category: category.categoryName,
        categoryId: category.categoryId,
        score: category.accuracy,
        totalQuestions: category.totalQuestions,
        correctAnswers: category.correct,
        incorrectAnswers: category.incorrect,
        timeSpent: category.totalTimeMinutes, // Tiempo real en minutos
        completedAt: category.completedAt,
        formattedDate: category.formattedDate,
        published: category.published,
        difficulty: category.accuracy >= 80 ? 'easy' : category.accuracy >= 60 ? 'medium' : 'hard'
      })) || [];
      
      setQuizHistory(quizHistoryData);
      console.log('✅ Detalle del estudiante cargado:', enrichedData);
    } catch (error) {
      console.error('❌ Error cargando detalle del estudiante:', error);
      
      // En caso de error de red, mostrar datos básicos del estudiante
      const fallbackData = {
        ...student,
        name: student?.name || 'Estudiante',
        email: student?.email || 'N/A',
        totalQuizzes: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        totalAnswers: 0,
        lastActivity: null,
        studentId: student?.id || 'N/A',
        created_at: student?.created_at || null,
        status: 'active',
        categoryStats: [],
        strengths: [],
        weaknesses: [],
        achievements: [
          { name: 'Estudiante Registrado', date: new Date().toISOString(), description: 'Se registró en el sistema' }
        ]
      };
      
      setStudentData(fallbackData);
      setQuizHistory([]);
      setConnectionError(true); // Marcar error de conexión
      
      // Mostrar mensaje de error temporal
      console.warn('⚠️ Usando datos básicos debido a problemas de conexión');
    } finally {
      setLoading(false);
    }
  }, [student]);

  // Función para recargar datos después de cambios
  const refreshStudentData = useCallback(async () => {
    console.log('🔄 Recargando datos del estudiante...');
    await loadStudentDetail();
  }, [loadStudentDetail]);

  const handleSendExplanations = async (category) => {
    console.log('🔍 handleSendExplanations llamado con:', category);
    console.log('🔍 categoryExplanations:', categoryExplanations);
    console.log('🔍 category.categoryId:', category.categoryId);
    
    console.log('📤 Enviando explicaciones para categoría:', category.categoryName);
    
    // Verificar que hay explicaciones para enviar
    const explanations = categoryExplanations[category.categoryId];
    console.log('🔍 Explicaciones encontradas:', explanations);
    
    if (!explanations || explanations.trim() === '') {
      console.log('⚠️ No hay explicaciones disponibles');
      showError('Sin explicaciones', 'No hay explicaciones disponibles para enviar');
      return;
    }
    
    // Mostrar confirmación
    showConfirm(
      'Enviar Explicaciones',
      `¿Estás seguro de que quieres enviar las explicaciones de "${category.categoryName}" al estudiante ${studentData.name}?`,
      async () => {
        // Usuario confirmó - proceder con el envío
        await sendExplanationsToDatabase(category, explanations);
      },
      () => {
        console.log('❌ Usuario canceló el envío');
      }
    );
  };

    const sendExplanationsToDatabase = async (category, explanations) => {
      try {
        console.log('✅ Usuario confirmó el envío');
        
        // Formatear explicaciones como array de objetos
      const formattedExplanations = explanations.split('\n').map((line, index) => {
        // Buscar patrones como "1. Pregunta: ..." o "Explicación: ..."
        if (line.includes('Pregunta:') || line.includes('Explicación:')) {
          return {
            question: `Pregunta ${index + 1}`,
            explanation: line.replace(/^\d+\.\s*/, '').replace(/^(Pregunta:|Explicación:)\s*/, ''),
            questionText: line.includes('Pregunta:') ? line.replace(/^\d+\.\s*Pregunta:\s*/, '') : ''
          };
        }
        return {
          question: `Pregunta ${index + 1}`,
          explanation: line,
          questionText: ''
        };
      }).filter(exp => exp.explanation.trim() !== '');

      // Enviar explicaciones a la base de datos
      console.log('📧 Enviando explicaciones a la base de datos...');
      console.log('🔍 StudentData.id:', studentData.id);
      console.log('🔍 Category.categoryId:', category.categoryId);
      console.log('🔍 Formatted explanations:', formattedExplanations);
      const result = await ExplanationsService.sendExplanationsToStudent(
        studentData.id,
        category.categoryId,
        formattedExplanations,
        category.categoryName
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Error al enviar explicaciones');
      }
      
      console.log('✅ Explicaciones enviadas exitosamente a la base de datos');
      
      // Actualizar el estado local
      console.log('🔄 Actualizando estado local...');
      setStudentData(prev => {
        const updatedStats = prev.categoryStats.map(cat => 
          cat.categoryId === category.categoryId 
            ? { ...cat, published: true }
            : cat
        );
        
        console.log('🔄 Stats actualizadas:', updatedStats);
        return {
          ...prev,
          categoryStats: updatedStats
        };
      });
      
      console.log('✅ Estado actualizado');
      
        // Mostrar mensaje de éxito
        showSuccess(
          'Explicaciones Enviadas',
          `Explicaciones enviadas exitosamente para ${category.categoryName}\n\nLas explicaciones han sido guardadas en la base de datos y están disponibles para el estudiante.`
        );
        
        // Recargar datos para reflejar los cambios
        await refreshStudentData();
        
      } catch (error) {
        console.error('❌ Error enviando explicaciones:', error);
        showError('Error al Enviar', 'Error al enviar las explicaciones. Inténtalo de nuevo.');
      }
    };

  const handleToggleStudyMode = async (category) => {
    console.log('🔍 handleToggleStudyMode llamado con:', category);
    console.log('🔍 category.modo actual:', category.modo);
    console.log('🔍 category.categoryId:', category.categoryId);
    
    try {
      const newModo = !category.modo;
      console.log('🔍 Nuevo modo:', newModo);
      
      // Actualizar el modo en la base de datos
      const { data, error } = await supabase
        .from('student_categories')
        .update({ 
          modo: newModo,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentData.id)
        .eq('category_id', category.categoryId);

      if (error) {
        console.error('❌ Error actualizando modo:', error);
        showError('Error', `Error actualizando modo: ${error.message}`);
        return;
      }

      console.log('✅ Modo actualizado exitosamente:', newModo);
      
      // Actualizar el estado local
      setStudentData(prevData => {
        const updatedCategoryStats = prevData.categoryStats.map(stat => {
          if (stat.categoryId === category.categoryId) {
            return { ...stat, modo: newModo };
          }
          return stat;
        });
        
        return {
          ...prevData,
          categoryStats: updatedCategoryStats
        };
      });
      
      showSuccess(
        'Modo Actualizado',
        newModo 
          ? `🎮 Modo Quiz habilitado para ${category.categoryName}. El estudiante puede hacer el quiz.`
          : `📚 Modo Estudio habilitado para ${category.categoryName}. El estudiante verá las explicaciones en el quiz.`
      );
      
    } catch (error) {
      console.error('❌ Error en handleToggleStudyMode:', error);
      showError('Error', 'Error actualizando el modo. Inténtalo de nuevo.');
    }
  };

  const handleToggleExplanations = async (category) => {
    console.log('🔄 Toggle explicaciones para categoría:', category);
    console.log('🔍 Estado actual de published:', category.published);
    console.log('🔍 studentData.id:', studentData.id);
    console.log('🔍 category.categoryId:', category.categoryId);
    
    try {
      const newStatus = !category.published;
      console.log('🔍 Nuevo estado:', newStatus);
      
      // Actualizar el estado en la base de datos usando el servicio
      const result = await StudentsService.toggleCategoryPublication(
        studentData.id, 
        category.categoryId, 
        newStatus
      );

      if (!result.success) {
        console.error('❌ Error actualizando estado de explicaciones:', result.error);
        showError('Error', `Error actualizando estado de explicaciones: ${result.error}`);
        return;
      }

      console.log('✅ Estado de explicaciones actualizado:', newStatus);
      console.log('✅ Resultado:', result);
      showSuccess(
        'Estado Actualizado',
        newStatus 
          ? `Explicaciones habilitadas para ${category.categoryName}` 
          : `Explicaciones deshabilitadas para ${category.categoryName}`
      );
      
      // Recargar datos del estudiante
      await refreshStudentData();
    } catch (error) {
      console.error('❌ Error en handleToggleExplanations:', error);
      showError('Error', 'Error actualizando estado de explicaciones');
    }
  };

  const handleToggleQuizMode = async (category) => {
    console.log('🎮 Toggle modo quiz para categoría:', category);
    console.log('🔍 Estado actual de modo:', category.modo);
    console.log('🔍 studentData.id:', studentData.id);
    console.log('🔍 category.categoryId:', category.categoryId);
    
    try {
      const newModo = !category.modo;
      console.log('🔍 Nuevo modo:', newModo);
      
      // Actualizar directamente en la base de datos
      const { data, error } = await supabase
        .from('student_categories')
        .update({ 
          modo: newModo
        })
        .eq('student_id', studentData.id)
        .eq('category_id', category.categoryId);

      if (error) {
        console.error('❌ Error actualizando modo:', error);
        throw error;
      }

      console.log('✅ Modo actualizado exitosamente:', newModo);
      
      // Mostrar mensaje de confirmación
      showSuccess(
        'Modo Actualizado',
        newModo 
          ? `🎮 Quiz habilitado para ${category.categoryName}. El estudiante puede hacer el quiz.`
          : `📚 Modo estudio activado para ${category.categoryName}. El estudiante solo puede ver explicaciones.`
      );
      
      // Recargar datos del estudiante
      await refreshStudentData();
    } catch (error) {
      console.error('❌ Error en handleToggleQuizMode:', error);
      showError('Error', 'Error actualizando modo del quiz');
    }
  };

  const handleViewCategory = (category) => {
    console.log('👁️ Viendo detalles de categoría:', category.categoryName);
    
    // Crear un modal con información detallada de la categoría
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 24px;
      max-width: 700px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      color: white;
      font-family: Arial, sans-serif;
    `;
    
    const explanations = categoryExplanations[category.categoryId] || 'No hay explicaciones disponibles';
    
    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #4CAF50;">📚 ${category.categoryName}</h2>
        <button onclick="this.closest('.modal').remove()" style="
          background: none;
          border: none;
          color: #999;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
        ">×</button>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #4CAF50; margin-bottom: 10px;">📊 Estadísticas</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #2a2a2a; padding: 12px; border-radius: 8px;">
            <div style="color: #999; font-size: 14px;">Preguntas</div>
            <div style="font-size: 20px; font-weight: bold; color: #4CAF50;">${category.totalQuestions}</div>
          </div>
          <div style="background: #2a2a2a; padding: 12px; border-radius: 8px;">
            <div style="color: #999; font-size: 14px;">Precisión</div>
            <div style="font-size: 20px; font-weight: bold; color: ${category.accuracy >= 70 ? '#4CAF50' : category.accuracy >= 50 ? '#FF9800' : '#F44336'};">${category.accuracy}%</div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #4CAF50; margin-bottom: 10px;">📤 Estado de Envío</h3>
        <div style="background: #2a2a2a; padding: 12px; border-radius: 8px;">
          ${category.published ? 
            '<span style="color: #4CAF50;">✅ Explicaciones enviadas</span>' : 
            '<span style="color: #FF9800;">⏳ Pendiente de envío</span>'
          }
        </div>
      </div>
      
      <div>
        <h3 style="color: #4CAF50; margin-bottom: 10px;">💡 Explicaciones</h3>
        <div style="background: #2a2a2a; padding: 16px; border-radius: 8px; max-height: 400px; overflow-y: auto; word-wrap: break-word;">
          <div style="margin: 0; white-space: pre-wrap; font-family: inherit; font-size: 13px; line-height: 1.5; color: #e0e0e0;">${explanations}</div>
        </div>
      </div>
    `;
    
    modal.className = 'modal';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  const loadCategoryExplanations = async () => {
    try {
      console.log('🔍 Cargando explicaciones por categoría...');
      
      if (!studentData.categoryStats || studentData.categoryStats.length === 0) {
        console.log('⚠️ No hay categorías para cargar explicaciones');
        return;
      }

      const explanations = {};
      
      for (const category of studentData.categoryStats) {
        try {
          console.log(`📚 Cargando explicaciones para categoría: ${category.categoryName}`);
          
          // Obtener preguntas de la categoría
          const questions = await StudentCategoriesService.getCategoryQuestions(
            category.categoryId, 
            student.id
          );
          
          // Filtrar solo las preguntas que tienen explicación
          const questionsWithExplanations = questions.filter(q => q.explanation && q.explanation.trim());
          
          if (questionsWithExplanations.length > 0) {
            // Crear un texto con todas las explicaciones de la categoría
            const explanationsText = questionsWithExplanations
              .map((q, index) => {
                const questionPreview = q.question.length > 50 
                  ? q.question.substring(0, 50) + '...' 
                  : q.question;
                return `${index + 1}. Pregunta: "${questionPreview}"\n   Explicación: ${q.explanation}`;
              })
              .join('\n\n');
            
            explanations[category.categoryId] = explanationsText;
            console.log(`✅ Explicaciones cargadas para ${category.categoryName}: ${questionsWithExplanations.length} preguntas`);
          } else {
            explanations[category.categoryId] = `No hay explicaciones disponibles para la categoría "${category.categoryName}".`;
            console.log(`⚠️ No hay explicaciones para ${category.categoryName}`);
          }
        } catch (error) {
          console.error(`❌ Error cargando explicaciones para ${category.categoryName}:`, error);
          explanations[category.categoryId] = `Error cargando explicaciones para "${category.categoryName}".`;
        }
      }
      
      setCategoryExplanations(explanations);
      console.log('✅ Explicaciones cargadas para todas las categorías');
      
    } catch (error) {
      console.error('❌ Error cargando explicaciones por categoría:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 useEffect ejecutándose con student:', student);
    if (student && student.id) {
      console.log('✅ Student tiene ID, cargando detalle...');
      loadStudentDetail();
    } else {
      console.log('⚠️ Student no tiene ID, mostrando datos básicos');
      // Si no hay estudiante, mostrar datos básicos
      setStudentData({
        name: 'Estudiante no encontrado',
        email: 'N/A',
        totalQuizzes: 0,
        averageScore: 0,
        totalAnswers: 0,
        lastActivity: null,
        studentId: 'N/A',
        created_at: null,
        status: 'inactive'
      });
      setLoading(false);
    }
  }, [student?.id]); // Solo depender del ID del estudiante

  // Polling para actualizar datos cada 30 segundos
  useEffect(() => {
    if (!student?.id) return;

    const interval = setInterval(() => {
      console.log('🔄 Actualización automática de datos del estudiante...');
      refreshStudentData();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [student?.id, refreshStudentData]);

  // Cargar explicaciones cuando se cambie al tab de explicaciones
  useEffect(() => {
    if (activeTab === 'explanations' && studentData.categoryStats && studentData.categoryStats.length > 0) {
      loadCategoryExplanations();
    }
  }, [activeTab, studentData.categoryStats]);

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return safeColor('success');
    if (score >= 60) return safeColor('warning');
    return safeColor('error');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return safeColor('success');
      case 'medium': return safeColor('warning');
      case 'hard': return safeColor('error');
      default: return safeColor('textMuted');
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Media';
      case 'hard': return 'Difícil';
      default: return 'Media';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: safeColor('textMuted')
      }}>
        Cargando detalle del estudiante...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      color: safeColor('textPrimary'),
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '16px'
      }}>
        {/* Botón volver */}
          <button
            onClick={() => onNavigate('students-list')}
            style={{
              background: 'transparent',
              color: safeColor('textMuted'),
              border: 'none',
            fontSize: '0.85rem',
              cursor: 'pointer',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
            gap: '4px',
            padding: '4px 6px',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = safeColor('primary') + '20';
            e.target.style.color = safeColor('primary');
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = safeColor('textMuted');
          }}
        >
          ← Volver
          </button>

        {/* Información del estudiante */}
        <div>
          <h1 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: safeColor('textPrimary'),
            margin: '0 0 2px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {studentData.name}
          </h1>
          <p style={{
            fontSize: '0.8rem',
            color: safeColor('textMuted'),
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {studentData.email}
          </p>
        </div>
      </div>

      {/* Banner de error de conexión */}
      {connectionError && (
        <div style={{
          background: safeColor('warning') + '20',
          border: `1px solid ${safeColor('warning')}`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ fontSize: '1.2rem' }}>⚠️</div>
          <div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: safeColor('warning'),
              marginBottom: '2px'
            }}>
              Problemas de conexión
        </div>
            <div style={{
              fontSize: '0.8rem',
              color: safeColor('textMuted')
            }}>
              Mostrando datos básicos. Algunas funciones pueden no estar disponibles.
      </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '16px',
        borderBottom: `1px solid ${safeColor('border')}`,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {[
          { id: 'quizzes', label: 'Historial', icon: '📝' },
          { id: 'explanations', label: 'Explicaciones', icon: '📤' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? safeColor('primary') : 'transparent',
              color: activeTab === tab.id ? 'white' : safeColor('textMuted'),
              border: 'none',
              borderRadius: '4px 4px 0 0',
              padding: '6px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.background = safeColor('primary') + '20';
                e.target.style.color = safeColor('primary');
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.background = 'transparent';
                e.target.style.color = safeColor('textMuted');
              }
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido de las tabs */}

      {activeTab === 'quizzes' && (
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          border: `1px solid ${safeColor('border')}`,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: `1px solid ${safeColor('border')}`
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              color: safeColor('textPrimary'),
              margin: 0
            }}>
              📝 Historial de Quizzes
            </h3>
          </div>
          
          {quizHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: safeColor('textMuted')
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: '0 0 8px 0',
                color: safeColor('textPrimary')
              }}>
                No hay quizzes completados
              </h3>
              <p style={{ margin: 0 }}>
                Este estudiante aún no ha completado ningún quiz
              </p>
            </div>
          ) : (
            <div>
              {quizHistory.map((quiz, index) => (
                <div
                  key={quiz.id}
                  style={{
                    padding: '20px',
                    borderBottom: index < quizHistory.length - 1 ? `1px solid ${safeColor('border')}33` : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: safeColor('textPrimary'),
                      margin: '0 0 8px 0'
                    }}>
                      {quiz.category}
                    </h4>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        background: safeColor('primary') + '20',
                        color: safeColor('primary'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        📊 {quiz.totalQuestions} preguntas
                      </span>
                      <span style={{
                        background: safeColor('success') + '20',
                        color: safeColor('success'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        ✅ {quiz.correctAnswers} correctas
                      </span>
                      <span style={{
                        background: safeColor('error') + '20',
                        color: safeColor('error'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        ❌ {quiz.incorrectAnswers} incorrectas
                      </span>
                      <span style={{
                        background: getDifficultyColor(quiz.difficulty) + '20',
                        color: getDifficultyColor(quiz.difficulty),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        🎯 {getDifficultyLabel(quiz.difficulty)}
                      </span>
                      <span style={{
                        background: safeColor('warning') + '20',
                        color: safeColor('warning'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        ⏱️ {formatTime(quiz.timeSpent)}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: safeColor('textMuted'),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span>📅 {quiz.formattedDate || formatDate(quiz.completedAt)}</span>
                      {quiz.published && (
                        <span style={{
                          color: safeColor('success'),
                          fontWeight: '600',
                          fontSize: '0.8rem'
                        }}>
                          ✅ Explicaciones habilitadas
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: getScoreColor(quiz.score),
                      marginBottom: '4px'
                    }}>
                      {quiz.score}%
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: safeColor('textMuted')
                    }}>
                      {quiz.correctAnswers}/{quiz.totalQuestions} correctas
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'explanations' && (
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '12px',
          border: `1px solid ${safeColor('border')}`,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${safeColor('border')}`
          }}>
          <h3 style={{
              fontSize: '1.1rem',
            fontWeight: '600',
            color: safeColor('textPrimary'),
              margin: 0
          }}>
              🎮 Control de Modo por Categoría
          </h3>
          <p style={{
              fontSize: '0.85rem',
            color: safeColor('textMuted'),
              margin: '4px 0 0 0'
          }}>
              Activa/desactiva el modo estudio para que el estudiante vea las explicaciones en el quiz
          </p>
        </div>

          <div style={{ padding: '16px' }}>
            {studentData.categoryStats && studentData.categoryStats.length > 0 ? (
        <div style={{
                    display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {studentData.categoryStats.map((category, index) => (
                  <div
                    key={index}
                    style={{
                  background: safeColor('dark'),
                      borderRadius: '8px',
                  padding: '16px',
                      border: `1px solid ${safeColor('border')}`
                    }}
                  >
                  <div style={{
                    display: 'flex',
                      justifyContent: 'space-between',
                    alignItems: 'center',
                      marginBottom: '12px'
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: safeColor('textPrimary'),
                        margin: '0 0 4px 0'
                      }}>
                          📂 {category.categoryName}
                      </h4>
                      <div style={{
                        fontSize: '0.8rem',
                        color: safeColor('textMuted')
                      }}>
                          {category.totalQuestions} preguntas • {category.accuracy}% de precisión
                      </div>
                    </div>
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <button
                            onClick={() => {
                              console.log('🔄 Toggle clicked para categoría:', category.categoryName);
                              console.log('🔍 Modo actual:', category.modo);
                              handleToggleQuizMode(category);
                            }}
                            style={{
                              position: 'relative',
                              width: '60px',
                              height: '28px',
                              borderRadius: '14px',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: category.modo ? '#4CAF50' : '#FF9800',
                              transition: 'all 0.3s ease',
                              outline: 'none',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              top: '2px',
                              left: category.modo ? '34px' : '2px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                            }} />
                          </button>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            color: category.modo ? safeColor('success') : '#666'
                          }}>
                            {category.modo ? 'Quiz Habilitado' : 'Modo Estudio'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '0.8rem',
                      color: category.modo ? safeColor('success') : safeColor('warning'),
                      marginBottom: '8px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {category.modo ? '🎮 Modo Quiz Activo' : '📚 Modo Estudio Activo'}
                    </div>
                </div>
              ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: safeColor('textMuted')
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: safeColor('textPrimary')
                }}>
                  No hay categorías asignadas
                </h3>
                <p style={{ margin: 0 }}>
                  Este estudiante no tiene categorías asignadas para enviar explicaciones
                  </p>
            </div>
          )}
            </div>
        </div>
      )}
      
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

export default AdminStudentDetailPage;