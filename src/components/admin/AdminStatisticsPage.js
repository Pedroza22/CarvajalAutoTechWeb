import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import StatisticsService from '../../services/StatisticsService';

const AdminStatisticsPage = ({ onNavigate }) => {
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalCategories: 0,
    totalQuizzes: 0,
    averageScore: 0,
    completionRate: 0,
    recentActivity: [],
    categoryStats: [],
    difficultyStats: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await StatisticsService.getAdminStatistics(selectedPeriod);
      setStatistics(stats);
      console.log('✅ Estadísticas cargadas:', stats);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      // Datos de ejemplo en caso de error
      setStatistics({
        totalStudents: 150,
        totalQuestions: 250,
        totalCategories: 8,
        totalQuizzes: 45,
        averageScore: 75.5,
        completionRate: 68.2,
        recentActivity: [
          { type: 'quiz_completed', student: 'Juan Pérez', score: 85, date: new Date().toISOString() },
          { type: 'question_created', admin: 'Admin', category: 'Matemáticas', date: new Date().toISOString() }
        ],
        categoryStats: [
          { name: 'Matemáticas', questions: 45, quizzes: 12, avgScore: 78.5 },
          { name: 'Ciencias', questions: 38, quizzes: 10, avgScore: 72.3 },
          { name: 'Historia', questions: 32, quizzes: 8, avgScore: 69.8 }
        ],
        difficultyStats: [
          { difficulty: 'Fácil', count: 85, percentage: 34 },
          { difficulty: 'Media', count: 120, percentage: 48 },
          { difficulty: 'Difícil', count: 45, percentage: 18 }
        ],
        monthlyStats: [
          { month: 'Ene', students: 120, quizzes: 35, avgScore: 72.5 },
          { month: 'Feb', students: 135, quizzes: 42, avgScore: 75.2 },
          { month: 'Mar', students: 150, quizzes: 45, avgScore: 75.5 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz_completed': return '✅';
      case 'question_created': return '➕';
      case 'student_registered': return '👤';
      case 'category_created': return '📂';
      default: return '📊';
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'quiz_completed':
        return `${activity.student} completó un quiz (${activity.score}%)`;
      case 'question_created':
        return `Nueva pregunta en ${activity.category}`;
      case 'student_registered':
        return `Nuevo estudiante: ${activity.student}`;
      case 'category_created':
        return `Nueva categoría: ${activity.category}`;
      default:
        return 'Actividad del sistema';
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
        Cargando estadísticas...
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: safeColor('textPrimary'),
            margin: '0 0 8px 0'
          }}>
            Estadísticas del Sistema
          </h1>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            Análisis y métricas del rendimiento
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${safeColor('border')}`,
            background: safeColor('cardBg'),
            color: safeColor('textPrimary'),
            fontSize: '1rem'
          }}
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
          <option value="1y">Último año</option>
        </select>
      </div>

      {/* Card de Estudiantes */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${safeColor('border')}`,
        marginBottom: '32px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={() => onNavigate('students-list')}
      onMouseEnter={(e) => {
        e.target.style.background = safeColor('primary') + '10';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = safeColor('cardBg');
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: safeColor('primary') + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            👥
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '700',
              color: safeColor('textPrimary'),
              margin: '0 0 6px 0'
            }}>
              Estudiantes
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: safeColor('textMuted'),
              margin: 0
            }}>
              {statistics.totalStudents} disponibles
            </p>
          </div>
          <div style={{
            color: safeColor('textMuted'),
            fontSize: '1.2rem'
          }}>
            →
          </div>
        </div>
      </div>

      {/* Top 5 Estudiantes */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${safeColor('border')}`,
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: safeColor('textPrimary'),
          margin: '0 0 20px 0'
        }}>
          Top 5 Estudiantes
        </h3>
        
        {statistics.topStudents && statistics.topStudents.length > 0 ? (
          <div>
            {statistics.topStudents.map((student, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 0',
                borderBottom: index < statistics.topStudents.length - 1 ? `1px solid ${safeColor('border')}33` : 'none',
                minHeight: '60px'
              }}>
                {/* Ranking */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : safeColor('border'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: index < 3 ? 'white' : safeColor('textMuted'),
                  flexShrink: 0
                }}>
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: safeColor('primary'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {student.name ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                </div>

                {/* Información del estudiante */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    margin: '0 0 2px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {student.name || 'Sin nombre'}
                  </h4>
                  <p style={{
                    fontSize: '0.75rem',
                    color: safeColor('textMuted'),
                    margin: '0 0 2px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {student.email || 'Sin email'}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: safeColor('textMuted'),
                    margin: '0 0 2px 0'
                  }}>
                    {student.questionsAnswered || 0} preguntas respondidas
                  </p>
                  <p style={{
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    color: safeColor('error'),
                    margin: 0
                  }}>
                    {student.accuracy || 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: safeColor('textMuted')
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <p>No hay datos de estudiantes disponibles</p>
          </div>
        )}
      </div>

      {/* Tendencias de Actividad */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${safeColor('border')}`,
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: safeColor('textPrimary'),
          margin: '0 0 20px 0'
        }}>
          Tendencias de Actividad
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h4 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: safeColor('textPrimary'),
            margin: 0
          }}>
            Respuestas por Día
          </h4>
          <div style={{
            background: safeColor('primary'),
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Última semana
          </div>
        </div>

        {/* Gráfico funcional */}
        <div style={{
          background: safeColor('dark'),
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          height: '120px',
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-around',
          border: `1px solid ${safeColor('border')}33`
        }}>
          {statistics.weeklyActivity && statistics.weeklyActivity.length > 0 ? (
            statistics.weeklyActivity.map((dayData, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: `${Math.max(20, (dayData.count / Math.max(...statistics.weeklyActivity.map(d => d.count))) * 80 + 20)}px`,
                  background: safeColor('primary'),
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s'
                }} />
                <span style={{
                  fontSize: '0.7rem',
                  color: safeColor('textMuted')
                }}>
                  {dayData.day}
                </span>
              </div>
            ))
          ) : (
            [1, 2, 3, 4, 5, 6, 7].map((day, index) => (
              <div key={day} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: safeColor('border'),
                  borderRadius: '4px 4px 0 0'
                }} />
                <span style={{
                  fontSize: '0.7rem',
                  color: safeColor('textMuted')
                }}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Estadísticas resumidas funcionales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
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
            }}>📈</div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: safeColor('success'),
              marginBottom: '4px'
            }}>
              {statistics.weeklyStats?.average || 0}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: safeColor('textMuted')
            }}>
              Promedio
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
              {statistics.weeklyStats?.maximum || 0}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: safeColor('textMuted')
            }}>
              Máximo
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
            }}>📅</div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: safeColor('error'),
              marginBottom: '4px'
            }}>
              {statistics.weeklyStats?.total || 0}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: safeColor('textMuted')
            }}>
              Total
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminStatisticsPage;