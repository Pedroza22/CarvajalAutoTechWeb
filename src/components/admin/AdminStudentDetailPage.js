import React, { useState, useEffect, useCallback } from 'react';
import { getColor } from '../../utils/constants';
import StudentsService from '../../services/StudentsService';
import StudentCategoriesService from '../../services/StudentCategoriesService';
import ExplanationsService from '../../services/ExplanationsService';

const AdminStudentDetailPage = ({ onNavigate, student }) => {
  console.log('🔍 AdminStudentDetailPage recibió student:', student);
  
  const [studentData, setStudentData] = useState(student || {});
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryExplanations, setCategoryExplanations] = useState({});
  const [connectionError, setConnectionError] = useState(false);

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
      
      // Generar historial de quizzes basado en las categorías
      const quizHistoryData = detailData.categoryStats?.map((category, index) => ({
        id: index + 1,
        quizName: `Quiz de ${category.categoryName}`,
        category: category.categoryName,
        score: category.accuracy,
        totalQuestions: category.totalQuestions,
        correctAnswers: Math.round((category.accuracy / 100) * category.totalQuestions),
        timeSpent: category.totalQuestions * 2, // Estimado
        completedAt: detailData.lastActivity || new Date().toISOString(),
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
    
    try {
      console.log('📤 Enviando explicaciones para categoría:', category.categoryName);
      
      // Verificar que hay explicaciones para enviar
      const explanations = categoryExplanations[category.categoryId];
      console.log('🔍 Explicaciones encontradas:', explanations);
      
      if (!explanations || explanations.trim() === '') {
        console.log('⚠️ No hay explicaciones disponibles');
        alert('No hay explicaciones disponibles para enviar');
        return;
      }
      
      // Mostrar confirmación
      const confirmed = window.confirm(
        `¿Estás seguro de que quieres enviar las explicaciones de "${category.categoryName}" al estudiante ${studentData.name}?`
      );
      
      if (!confirmed) {
        console.log('❌ Usuario canceló el envío');
        return;
      }
      
      console.log('✅ Usuario confirmó el envío');
      
      // Enviar explicaciones a la base de datos
      console.log('📧 Enviando explicaciones a la base de datos...');
      console.log('🔍 StudentData.id:', studentData.id);
      console.log('🔍 Category.categoryId:', category.categoryId);
      const result = await ExplanationsService.sendExplanationsToStudent(
        studentData.id,
        category.categoryId,
        explanations,
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
      alert(`✅ Explicaciones enviadas exitosamente para ${category.categoryName}\n\nLas explicaciones han sido guardadas en la base de datos y están disponibles para el estudiante.`);
      
      // Recargar datos para reflejar los cambios
      await refreshStudentData();
      
    } catch (error) {
      console.error('❌ Error enviando explicaciones:', error);
      alert('❌ Error al enviar las explicaciones. Inténtalo de nuevo.');
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
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
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
        <div style="background: #2a2a2a; padding: 12px; border-radius: 8px; max-height: 200px; overflow-y: auto;">
          <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.4;">${explanations}</pre>
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
          { id: 'overview', label: 'Resumen', icon: '📊' },
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
      {activeTab === 'overview' && (
        <div>
          {/* Métricas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: safeColor('cardBg'),
              borderRadius: '8px',
              padding: '12px',
              border: `1px solid ${safeColor('border')}`,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.2rem',
                marginBottom: '6px'
              }}>📝</div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: safeColor('primary'),
                margin: '0 0 2px 0'
              }}>
                {studentData.totalQuizzes || 0}
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                Quizzes Completados
              </p>
            </div>

            <div style={{
              background: safeColor('cardBg'),
              borderRadius: '8px',
              padding: '12px',
              border: `1px solid ${safeColor('border')}`,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.2rem',
                marginBottom: '6px'
              }}>⭐</div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: getScoreColor(studentData.averageScore || 0),
                margin: '0 0 2px 0'
              }}>
                {studentData.averageScore ? `${studentData.averageScore}%` : 'N/A'}
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                Puntuación Promedio
              </p>
            </div>

            <div style={{
              background: safeColor('cardBg'),
              borderRadius: '8px',
              padding: '12px',
              border: `1px solid ${safeColor('border')}`,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.2rem',
                marginBottom: '6px'
              }}>⏱️</div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: safeColor('warning'),
                margin: '0 0 2px 0'
              }}>
                {formatTime(studentData.totalTimeSpent || 0)}
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                Tiempo Total
              </p>
            </div>

            <div style={{
              background: safeColor('cardBg'),
              borderRadius: '8px',
              padding: '12px',
              border: `1px solid ${safeColor('border')}`,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.2rem',
                marginBottom: '6px'
              }}>📅</div>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                color: safeColor('textPrimary'),
                margin: '0 0 2px 0',
                lineHeight: '1.1'
              }}>
                {formatDate(studentData.lastActivity)}
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                Última Actividad
              </p>
            </div>
          </div>

        </div>
      )}

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
                      {quiz.quizName}
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
                        📂 {quiz.category}
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
                      color: safeColor('textMuted')
                    }}>
                      📅 {formatDate(quiz.completedAt)}
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
              📤 Enviar Explicaciones por Categoría
          </h3>
          <p style={{
              fontSize: '0.85rem',
            color: safeColor('textMuted'),
              margin: '4px 0 0 0'
          }}>
              Explicaciones automáticas de las preguntas creadas para cada categoría
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
                        <button
                          onClick={() => {
                            console.log('🔍 Botón Enviar clickeado');
                            console.log('🔍 category.published:', category.published);
                            console.log('🔍 category:', category);
                            handleSendExplanations(category);
                          }}
                          disabled={category.published}
                          style={{
                            background: category.published ? safeColor('success') : safeColor('primary'),
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            cursor: category.published ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: category.published ? 0.7 : 1,
                            transition: 'all 0.2s'
                          }}
                        >
                          {category.published ? '✅ Enviado' : '📤 Enviar'}
                        </button>
                        <button
                          onClick={() => handleViewCategory(category)}
                          style={{
                            background: 'transparent',
                    color: safeColor('textMuted'),
                            border: `1px solid ${safeColor('border')}`,
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = safeColor('primary') + '20';
                            e.target.style.color = safeColor('primary');
                            e.target.style.borderColor = safeColor('primary');
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = safeColor('textMuted');
                            e.target.style.borderColor = safeColor('border');
                          }}
                        >
                          👁️ Ver
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '0.8rem',
                      color: category.published ? safeColor('success') : safeColor('warning'),
                      marginBottom: '8px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {category.published ? '✅ Explicaciones enviadas' : '⏳ Pendiente de envío'}
                    </div>
                    
                    {categoryExplanations[category.categoryId] ? (
                      <textarea
                        value={categoryExplanations[category.categoryId]}
                        placeholder={`Cargando explicaciones para ${category.categoryName}...`}
                        readOnly
                        style={{
                          width: '100%',
                          minHeight: '120px',
                          padding: '12px',
                          borderRadius: '6px',
                          border: `1px solid ${safeColor('border')}`,
                          background: safeColor('cardBg'),
                          color: safeColor('textPrimary'),
                          fontSize: '0.85rem',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                    lineHeight: '1.4'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '12px',
                        borderRadius: '6px',
                        border: `1px solid ${safeColor('border')}`,
                        background: safeColor('cardBg'),
                        color: safeColor('textMuted'),
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontStyle: 'italic'
                      }}>
                        🔄 Cargando explicaciones para {category.categoryName}...
                      </div>
                    )}
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
    </div>
  );
};

export default AdminStudentDetailPage;