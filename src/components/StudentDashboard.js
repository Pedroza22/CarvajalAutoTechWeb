import React from 'react';
import { AppConstants } from '../utils/constants';
import CustomButton from './CustomButton';
import StudentStatsCard from './StudentStatsCard';
import CategoryQuizCard from './CategoryQuizCard';

// Fallback colors en caso de que AppConstants no esté disponible
const fallbackColors = {
  dark: '#0f0f0f',
  textPrimary: '#ffffff',
  border: '#4b5563',
  primary: '#3b82f6',
  cardBg: '#1f2937',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b'
};

// Función segura para obtener colores
const safeColor = (colorName) => {
  return AppConstants?.colors?.[colorName] || fallbackColors[colorName] || '#4b5563';
};

const StudentDashboard = ({ 
  user, 
  categories = [], 
  isLoadingCategories = false, 
  studentStats = {}, 
  onLogout, 
  onStartQuiz 
}) => {
  const categoriesList = Array.isArray(categories) ? categories : [];
  const categoriesCount = categoriesList.length;

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
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: 0
          }}>
            Mi Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: safeColor('primary'),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: '18px' }}>👤</span>
            </div>
            <CustomButton
              onClick={onLogout}
              text="Cerrar Sesión"
              variant="secondary"
              size="small"
              icon="🚪"
              fullWidth={false}
              style={{
                background: `${safeColor('secondary')}20`,
                border: `1px solid ${safeColor('secondary')}40`,
                color: safeColor('secondary')
              }}
            />
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px'
      }}>
        {/* Welcome Section */}
        <div style={{
          background: `linear-gradient(135deg, ${safeColor('primary')}, ${safeColor('primary')}CC)`,
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: `0 6px 12px ${safeColor('primary')}4D`
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: `${safeColor('textPrimary')}33`,
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '30px' }}>🎓</span>
            </div>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 0 4px 0'
              }}>
                ¡Hola, {user?.user_metadata?.first_name || 'Estudiante'}!
              </h2>
              <p style={{
                margin: 0,
                opacity: 0.8
              }}>
                Continúa aprendiendo y mejorando
              </p>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '4px' }}>🔥</span>
            <span style={{ fontWeight: '600' }}>
              Racha de {studentStats?.streak || 0} días
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <StudentStatsCard
            title="Total Respondidas"
            value={studentStats?.totalAnswered?.toString() || '0'}
            icon="❓"
            color={safeColor('primary')}
          />
          <StudentStatsCard
            title="Correctas"
            value={studentStats?.correctAnswers?.toString() || '0'}
            icon="✓"
            color={safeColor('success')}
          />
          <StudentStatsCard
            title="Incorrectas"
            value={studentStats?.incorrectAnswers?.toString() || '0'}
            icon="✗"
            color={safeColor('error')}
          />
          <StudentStatsCard
            title="Precisión"
            value={`${studentStats?.accuracyPercentage?.toFixed(1) || 0}%`}
            icon="📊"
            color={safeColor('warning')}
          />
        </div>

        {/* Categories Section */}
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '20px',
          padding: '32px',
          border: `1px solid ${safeColor('border')}`
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '24px',
            color: safeColor('textPrimary')
          }}>
            Categorías Disponibles
          </h3>
          
          {isLoadingCategories ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px'
            }}>
              <div style={{ fontSize: '18px', color: safeColor('textMuted') }}>
                Cargando categorías...
              </div>
            </div>
          ) : categoriesCount === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px'
            }}>
              <div style={{ fontSize: '18px', color: safeColor('textMuted') }}>
                No hay categorías disponibles
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {categoriesList.map((category) => (
                <CategoryQuizCard
                  key={category.id}
                  category={category}
                  onStartQuiz={() => onStartQuiz(category.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: safeColor('cardBg'),
          borderRadius: '20px',
          padding: '32px',
          marginTop: '24px',
          border: `1px solid ${safeColor('border')}`
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            Progreso Reciente
          </h3>
          <div style={{
            background: safeColor('cardBg'),
            borderRadius: '16px',
            border: `1px solid ${safeColor('border')}4D`
          }}>
            {[
              {
                title: 'Quiz de Matemáticas',
                subtitle: '8/10 correctas - 80%',
                time: 'Hace 2 horas',
                icon: '📊',
                color: safeColor('success')
              },
              {
                title: 'Quiz de Ciencias',
                subtitle: '6/8 correctas - 75%',
                time: 'Ayer',
                icon: '🔬',
                color: safeColor('primary')
              },
              {
                title: 'Quiz de Historia',
                subtitle: '7/9 correctas - 78%',
                time: 'Hace 3 días',
                icon: '📚',
                color: safeColor('warning')
              }
            ].map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  borderBottom: index < 2 ? `1px solid ${safeColor('border')}33` : 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: `${activity.color}20`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  fontSize: '20px'
                }}>
                  {activity.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    color: safeColor('textPrimary')
                  }}>
                    {activity.title}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: safeColor('textMuted'),
                    margin: '0 0 4px 0'
                  }}>
                    {activity.subtitle}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: safeColor('textMuted'),
                    margin: 0
                  }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;