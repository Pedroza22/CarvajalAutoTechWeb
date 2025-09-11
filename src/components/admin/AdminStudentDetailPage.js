import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import StudentsService from '../../services/StudentsService';

const AdminStudentDetailPage = ({ student, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (student) {
      loadStudentDetail();
    }
  }, [student]);

  const loadStudentDetail = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Cargando detalle del estudiante desde Supabase...');
      const studentDetail = await StudentsService.getStudentDetail(student.id);
      
      setStudentData(studentDetail);
      setCategoryStats(studentDetail.categoryStats || []);
      console.log('✅ Detalle del estudiante cargado:', studentDetail);
    } catch (error) {
      console.error('❌ Error cargando detalle del estudiante:', error);
      // En caso de error, usar datos básicos
      setStudentData({
        ...student,
        totalAnswers: student.totalAnswers || 0,
        overallAccuracy: student.accuracy || 0,
        lastActivity: 'Sin datos',
        joinedDate: 'Fecha no disponible',
        categoryStats: []
      });
      setCategoryStats([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryPublication = async (categoryId, currentState) => {
    try {
      console.log(`🔄 Cambiando publicación de categoría ${categoryId} a ${!currentState}`);
      
      // Llamar al servicio real
      await StudentsService.toggleCategoryPublication(student.id, categoryId, !currentState);
      
      // Actualizar estado local
      setCategoryStats(prev => prev.map(cat => 
        cat.categoryId === categoryId 
          ? { ...cat, published: !currentState }
          : cat
      ));
      
      console.log('✅ Publicación cambiada exitosamente');
    } catch (error) {
      console.error('❌ Error cambiando estado de publicación:', error);
      // Mostrar mensaje de error al usuario
      alert('Error al cambiar el estado de publicación. Por favor, inténtalo de nuevo.');
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  if (!studentData) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: safeColor('textMuted')
      }}>
        No se encontraron datos del estudiante
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      color: safeColor('textPrimary'),
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: `1px solid ${safeColor('border')}`,
            borderRadius: '8px',
            padding: '8px 12px',
            color: safeColor('textPrimary'),
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Volver
        </button>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: safeColor('textPrimary'),
          margin: 0
        }}>
          Detalle del Estudiante
        </h1>
      </div>

      {/* Información del estudiante */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: `1px solid ${safeColor('border')}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: safeColor('primary'),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            {getInitials(studentData.name)}
          </div>

          {/* Información básica */}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: safeColor('textPrimary')
            }}>
              {studentData.name}
            </h2>
            <p style={{
              fontSize: '1rem',
              color: safeColor('textMuted'),
              margin: '0 0 8px 0'
            }}>
              {studentData.email}
            </p>
            <div style={{
              display: 'flex',
              gap: '24px',
              fontSize: '0.9rem',
              color: safeColor('textMuted')
            }}>
              <span>Se unió: {studentData.joinedDate}</span>
              <span>Última actividad: {studentData.lastActivity}</span>
            </div>
          </div>

          {/* Estadísticas generales */}
          <div style={{
            display: 'flex',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: safeColor('textPrimary')
              }}>
                {studentData.totalAnswers}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: safeColor('textMuted')
              }}>
                Respuestas
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: safeColor('success')
              }}>
                {studentData.overallAccuracy}%
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: safeColor('textMuted')
              }}>
                Precisión
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de publicación */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: `1px solid ${safeColor('border')}`
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '700',
          marginBottom: '16px',
          color: safeColor('textPrimary')
        }}>
          Gestión de Publicación por Categorías
        </h3>
        
        <p style={{
          fontSize: '0.9rem',
          color: safeColor('textMuted'),
          marginBottom: '20px'
        }}>
          Controla qué categorías están publicadas para este estudiante
        </p>

        {categoryStats.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: safeColor('textMuted')
          }}>
            No hay categorías asignadas
          </div>
        ) : (
          <div>
            {categoryStats.map((category, index) => (
              <div
                key={category.categoryId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderBottom: index < categoryStats.length - 1 ? `1px solid ${safeColor('border')}33` : 'none',
                  background: category.published ? `${safeColor('success')}10` : 'transparent',
                  borderRadius: category.published ? '8px' : '0',
                  marginBottom: category.published ? '8px' : '0'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    marginBottom: '4px'
                  }}>
                    {category.categoryName}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted')
                  }}>
                    {category.answered}/{category.totalQuestions} preguntas • {category.accuracy}% precisión
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: safeColor('textMuted'),
                    marginTop: '2px'
                  }}>
                    Última respuesta: {category.lastAnswered}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '4px 8px',
                    background: category.published ? `${safeColor('success')}20` : `${safeColor('textMuted')}20`,
                    borderRadius: '12px',
                    border: `1px solid ${category.published ? safeColor('success') : safeColor('textMuted')}40`
                  }}>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: category.published ? safeColor('success') : safeColor('textMuted')
                    }}>
                      {category.published ? 'Publicado' : 'No publicado'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCategoryPublication(category.categoryId, category.published)}
                    disabled={category.answered === 0}
                    style={{
                      background: category.published ? safeColor('warning') : safeColor('success'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      cursor: category.answered > 0 ? 'pointer' : 'not-allowed',
                      opacity: category.answered === 0 ? 0.5 : 1
                    }}
                  >
                    {category.published ? 'Despublicar' : 'Publicar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen de actividad */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${safeColor('border')}`
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '700',
          marginBottom: '16px',
          color: safeColor('textPrimary')
        }}>
          Resumen de Actividad
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {categoryStats.map(category => (
            <div
              key={category.categoryId}
              style={{
                padding: '16px',
                background: safeColor('dark'),
                borderRadius: '12px',
                border: `1px solid ${safeColor('border')}`
              }}
            >
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: safeColor('textPrimary'),
                marginBottom: '8px'
              }}>
                {category.categoryName}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: safeColor('textMuted'),
                marginBottom: '4px'
              }}>
                Progreso: {category.answered}/{category.totalQuestions}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: safeColor('textMuted'),
                marginBottom: '8px'
              }}>
                Precisión: {category.accuracy}%
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: safeColor('border'),
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(category.answered / category.totalQuestions) * 100}%`,
                  height: '100%',
                  background: safeColor('primary'),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStudentDetailPage;
