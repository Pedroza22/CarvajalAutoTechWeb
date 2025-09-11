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

      {/* Métricas principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${safeColor('border')}`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '12px'
          }}>👥</div>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: safeColor('primary'),
            margin: '0 0 8px 0'
          }}>
            {statistics.totalStudents}
          </h3>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            Estudiantes Activos
          </p>
        </div>

        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${safeColor('border')}`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '12px'
          }}>❓</div>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: safeColor('success'),
            margin: '0 0 8px 0'
          }}>
            {statistics.totalQuestions}
          </h3>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            Preguntas Totales
          </p>
        </div>

        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${safeColor('border')}`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '12px'
          }}>📊</div>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: safeColor('warning'),
            margin: '0 0 8px 0'
          }}>
            {statistics.averageScore}%
          </h3>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            Puntuación Promedio
          </p>
        </div>

        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${safeColor('border')}`,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '12px'
          }}>🎯</div>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: safeColor('error'),
            margin: '0 0 8px 0'
          }}>
            {statistics.completionRate}%
          </h3>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            Tasa de Finalización
          </p>
        </div>
      </div>

      {/* Gráficos y análisis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Estadísticas por categoría */}
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
            📂 Por Categoría
          </h3>
          {statistics.categoryStats.map((category, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < statistics.categoryStats.length - 1 ? `1px solid ${safeColor('border')}33` : 'none'
            }}>
              <div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '4px'
                }}>
                  {category.name}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: safeColor('textMuted')
                }}>
                  {category.questions} preguntas • {category.quizzes} quizzes
                </div>
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: safeColor('success')
              }}>
                {category.avgScore}%
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas por dificultad */}
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
            🎯 Por Dificultad
          </h3>
          {statistics.difficultyStats.map((difficulty, index) => (
            <div key={index} style={{
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary')
                }}>
                  {difficulty.difficulty}
                </span>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textMuted')
                }}>
                  {difficulty.count} ({difficulty.percentage}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: safeColor('border'),
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${difficulty.percentage}%`,
                  height: '100%',
                  background: index === 0 ? safeColor('success') : 
                             index === 1 ? safeColor('warning') : safeColor('error'),
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
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
          📈 Actividad Reciente
        </h3>
        {statistics.recentActivity.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: safeColor('textMuted')
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div>
            {statistics.recentActivity.map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: index < statistics.recentActivity.length - 1 ? `1px solid ${safeColor('border')}33` : 'none'
              }}>
                <div style={{
                  fontSize: '1.5rem'
                }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    color: safeColor('textPrimary'),
                    marginBottom: '4px'
                  }}>
                    {getActivityText(activity)}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: safeColor('textMuted')
                  }}>
                    {formatDate(activity.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas mensuales */}
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
          📅 Tendencias Mensuales
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {statistics.monthlyStats.map((month, index) => (
            <div key={index} style={{
              background: safeColor('dark'),
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${safeColor('border')}33`
            }}>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: safeColor('primary'),
                marginBottom: '8px'
              }}>
                {month.month}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: safeColor('textMuted'),
                marginBottom: '4px'
              }}>
                👥 {month.students} estudiantes
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: safeColor('textMuted'),
                marginBottom: '4px'
              }}>
                📊 {month.quizzes} quizzes
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: safeColor('success'),
                fontWeight: '600'
              }}>
                ⭐ {month.avgScore}% promedio
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStatisticsPage;