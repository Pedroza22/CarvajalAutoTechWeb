import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import StatisticsService from '../../services/StatisticsService';

const AdminStatisticsPage = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState(null);
  const [topStudents, setTopStudents] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas generales
      const stats = await StatisticsService.getAdminStats();
      setOverallStats(stats);

      // Cargar top estudiantes (simulado por ahora)
      setTopStudents([
        { name: 'Juan Pérez', email: 'juan@email.com', accuracy: 95, questionsAnswered: 45, rank: 1 },
        { name: 'María García', email: 'maria@email.com', accuracy: 92, questionsAnswered: 38, rank: 2 },
        { name: 'Carlos López', email: 'carlos@email.com', accuracy: 89, questionsAnswered: 42, rank: 3 },
        { name: 'Ana Martínez', email: 'ana@email.com', accuracy: 87, questionsAnswered: 35, rank: 4 },
        { name: 'Luis Rodríguez', email: 'luis@email.com', accuracy: 85, questionsAnswered: 40, rank: 5 },
      ]);

      // Cargar tendencias (simulado por ahora)
      setTrends([
        { day: 'Lun', answers: 45 },
        { day: 'Mar', answers: 52 },
        { day: 'Mié', answers: 38 },
        { day: 'Jue', answers: 61 },
        { day: 'Vie', answers: 48 },
        { day: 'Sáb', answers: 23 },
        { day: 'Dom', answers: 19 },
      ]);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

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
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: safeColor('textPrimary'),
          margin: 0
        }}>
          Estadísticas
        </h1>
        <button
          onClick={loadStatistics}
          style={{
            background: safeColor('primary'),
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjeta de Estudiantes */}
      <div
        onClick={() => onNavigate('admin-students')}
        style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${safeColor('border')}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: `${safeColor('info')}20`,
            borderRadius: '12px',
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
              margin: '0 0 6px 0',
              color: safeColor('textPrimary')
            }}>
              Estudiantes
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: safeColor('textMuted'),
              margin: 0
            }}>
              {overallStats?.systemStats?.total_students || 0} disponibles
            </p>
          </div>
          <div style={{ color: safeColor('textMuted'), fontSize: '20px' }}>
            ›
          </div>
        </div>
      </div>

      {/* Top Estudiantes */}
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
          Top 5 Estudiantes
        </h3>
        
        {topStudents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: safeColor('textMuted')
          }}>
            No hay datos de estudiantes disponibles
          </div>
        ) : (
          <div>
            {topStudents.map((student, index) => (
              <div
                key={student.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index < topStudents.length - 1 ? `1px solid ${safeColor('border')}33` : 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: index < 3 ? safeColor('primary') : safeColor('textMuted'),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginRight: '12px'
                }}>
                  {student.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    marginBottom: '2px'
                  }}>
                    {student.name}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: safeColor('textMuted')
                  }}>
                    {student.questionsAnswered} preguntas
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  background: `${safeColor('success')}20`,
                  borderRadius: '12px',
                  border: `1px solid ${safeColor('success')}40`
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: safeColor('success')
                  }}>
                    {student.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gráfico de Tendencias */}
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
          Tendencias de Actividad
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
          height: '120px',
          padding: '0 8px'
        }}>
          {trends.map((trend, index) => {
            const maxAnswers = Math.max(...trends.map(t => t.answers));
            const height = (trend.answers / maxAnswers) * 80;
            
            return (
              <div key={trend.day} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: '24px',
                  height: `${height}px`,
                  background: safeColor('primary'),
                  borderRadius: '4px 4px 0 0',
                  margin: '0 auto 8px auto',
                  minHeight: '4px'
                }} />
                <div style={{
                  fontSize: '0.8rem',
                  color: safeColor('textMuted'),
                  fontWeight: '500'
                }}>
                  {trend.day}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: safeColor('textMuted'),
                  marginTop: '2px'
                }}>
                  {trend.answers}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminStatisticsPage;


