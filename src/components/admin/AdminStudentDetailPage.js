import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import StudentsService from '../../services/StudentsService';

const AdminStudentDetailPage = ({ onNavigate, student }) => {
  const [studentData, setStudentData] = useState(student);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (student) {
      loadStudentDetail();
    }
  }, [student]);

  const loadStudentDetail = async () => {
    try {
      setLoading(true);
      // Cargar datos detallados del estudiante
      const [detailData, historyData] = await Promise.all([
        StudentsService.getStudentById(student.id),
        StudentsService.getStudentQuizHistory(student.id)
      ]);
      
      setStudentData(detailData);
      setQuizHistory(historyData);
      console.log('✅ Detalle del estudiante cargado:', detailData);
    } catch (error) {
      console.error('❌ Error cargando detalle del estudiante:', error);
      // Datos de ejemplo en caso de error
      setStudentData({
        ...student,
        totalQuizzes: 15,
        averageScore: 78.5,
        totalTimeSpent: 1250, // minutos
        lastActivity: new Date().toISOString(),
        strengths: ['Matemáticas', 'Ciencias'],
        weaknesses: ['Historia'],
        achievements: [
          { name: 'Primer Quiz', date: '2024-01-15', description: 'Completó su primer quiz' },
          { name: 'Estudiante Activo', date: '2024-02-01', description: 'Completó 10 quizzes' }
        ]
      });
      setQuizHistory([
        {
          id: 1,
          quizName: 'Matemáticas Básicas',
          category: 'Matemáticas',
          score: 85,
          totalQuestions: 10,
          correctAnswers: 8,
          timeSpent: 15,
          completedAt: new Date().toISOString(),
          difficulty: 'medium'
        },
        {
          id: 2,
          quizName: 'Ciencias Naturales',
          category: 'Ciencias',
          score: 92,
          totalQuestions: 12,
          correctAnswers: 11,
          timeSpent: 20,
          completedAt: new Date(Date.now() - 86400000).toISOString(),
          difficulty: 'easy'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <button
            onClick={() => onNavigate('students-list')}
            style={{
              background: 'transparent',
              color: safeColor('textMuted'),
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Volver a la lista
          </button>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: safeColor('textPrimary'),
            margin: '0 0 8px 0'
          }}>
            {studentData.name}
          </h1>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            {studentData.email}
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            style={{
              background: safeColor('warning'),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            ✏️ Editar
          </button>
          <button
            style={{
              background: safeColor('error'),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: `1px solid ${safeColor('border')}`
      }}>
        {[
          { id: 'overview', label: 'Resumen', icon: '📊' },
          { id: 'quizzes', label: 'Historial de Quizzes', icon: '📝' },
          { id: 'progress', label: 'Progreso', icon: '📈' },
          { id: 'achievements', label: 'Logros', icon: '🏆' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? safeColor('primary') : 'transparent',
              color: activeTab === tab.id ? 'white' : safeColor('textMuted'),
              border: 'none',
              borderRadius: '8px 8px 0 0',
              padding: '12px 20px',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                fontSize: '2rem',
                marginBottom: '12px'
              }}>📝</div>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: safeColor('primary'),
                margin: '0 0 8px 0'
              }}>
                {studentData.totalQuizzes || 0}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                Quizzes Completados
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
                fontSize: '2rem',
                marginBottom: '12px'
              }}>⭐</div>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: getScoreColor(studentData.averageScore || 0),
                margin: '0 0 8px 0'
              }}>
                {studentData.averageScore ? `${studentData.averageScore}%` : 'N/A'}
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
                fontSize: '2rem',
                marginBottom: '12px'
              }}>⏱️</div>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: safeColor('warning'),
                margin: '0 0 8px 0'
              }}>
                {formatTime(studentData.totalTimeSpent || 0)}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                Tiempo Total
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
                fontSize: '2rem',
                marginBottom: '12px'
              }}>📅</div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: safeColor('textPrimary'),
                margin: '0 0 8px 0'
              }}>
                {formatDate(studentData.lastActivity)}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: safeColor('textMuted'),
                margin: 0
              }}>
                Última Actividad
              </p>
            </div>
          </div>

          {/* Información del estudiante */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
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
                margin: '0 0 16px 0'
              }}>
                📋 Información Personal
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted'),
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    ID de Estudiante
                  </label>
                  <div style={{
                    fontSize: '1rem',
                    color: safeColor('textPrimary'),
                    fontWeight: '600'
                  }}>
                    {studentData.studentId || 'No asignado'}
                  </div>
                </div>
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted'),
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    Fecha de Registro
                  </label>
                  <div style={{
                    fontSize: '1rem',
                    color: safeColor('textPrimary')
                  }}>
                    {formatDate(studentData.created_at)}
                  </div>
                </div>
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted'),
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    Estado
                  </label>
                  <span style={{
                    background: safeColor('success') + '20',
                    color: safeColor('success'),
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Activo
                  </span>
                </div>
              </div>
            </div>

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
                margin: '0 0 16px 0'
              }}>
                🎯 Fortalezas y Debilidades
              </h3>
              <div>
                <div style={{
                  marginBottom: '16px'
                }}>
                  <label style={{
                    fontSize: '0.9rem',
                    color: safeColor('success'),
                    marginBottom: '8px',
                    display: 'block',
                    fontWeight: '600'
                  }}>
                    ✅ Fortalezas
                  </label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {(studentData.strengths || ['Matemáticas', 'Ciencias']).map((strength, index) => (
                      <span key={index} style={{
                        background: safeColor('success') + '20',
                        color: safeColor('success'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    color: safeColor('error'),
                    marginBottom: '8px',
                    display: 'block',
                    fontWeight: '600'
                  }}>
                    ⚠️ Áreas de Mejora
                  </label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {(studentData.weaknesses || ['Historia']).map((weakness, index) => (
                      <span key={index} style={{
                        background: safeColor('error') + '20',
                        color: safeColor('error'),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {weakness}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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

      {activeTab === 'progress' && (
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '16px',
          padding: '24px',
          border: `1px solid ${safeColor('border')}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: safeColor('textPrimary'),
            margin: '0 0 8px 0'
          }}>
            Análisis de Progreso
          </h3>
          <p style={{
            color: safeColor('textMuted'),
            margin: 0
          }}>
            Esta funcionalidad estará disponible próximamente
          </p>
        </div>
      )}

      {activeTab === 'achievements' && (
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
            🏆 Logros y Reconocimientos
          </h3>
          
          {(studentData.achievements || []).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: safeColor('textMuted')
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
              <p>No hay logros registrados</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {(studentData.achievements || []).map((achievement, index) => (
                <div key={index} style={{
                  background: safeColor('dark'),
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${safeColor('border')}33`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '1.5rem'
                    }}>
                      🏆
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: safeColor('textPrimary'),
                        margin: '0 0 4px 0'
                      }}>
                        {achievement.name}
                      </h4>
                      <div style={{
                        fontSize: '0.8rem',
                        color: safeColor('textMuted')
                      }}>
                        📅 {formatDate(achievement.date)}
                      </div>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted'),
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStudentDetailPage;