import React, { useState, useEffect, useMemo } from 'react';
import { AppConstants } from '../utils/constants';
import CustomButton from './CustomButton';
import CategoryQuizCard from './CategoryQuizCard';
import StudentsService from '../services/StudentsService';
import QuizProgressService from '../services/QuizProgressService';
import StatisticsService from '../services/StatisticsService';

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
  onLogout, 
  onStartQuiz,
  onNavigate
}) => {
  const categoriesList = useMemo(() => Array.isArray(categories) ? categories : [], [categories]);
  
  // Estados para las nuevas funcionalidades
  const [categoryPublicationStatus, setCategoryPublicationStatus] = useState({});
  const [categoryStats, setCategoryStats] = useState({});
  const [studentStats, setStudentStats] = useState({
    totalAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracyPercentage: 0
  });
  const [studentId, setStudentId] = useState(null);
  const categoriesCount = categoriesList.length;

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

  // Cargar estado de publicación y estadísticas por categoría
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!user?.id || !studentId) return;
      
      try {
        const [publicationStatus, stats] = await Promise.all([
          StatisticsService.getCategoryPublicationStatus(user.id),
          StatisticsService.getStudentStatistics(user.id)
        ]);
        
        // Transformar publicationStatus a un objeto por category_id
        const publicationStatusMap = {};
        if (publicationStatus) {
          publicationStatus.forEach(item => {
            publicationStatusMap[item.category_id] = item.published;
          });
        }
        
        // Transformar stats a un objeto por category_id
        const statsMap = {};
        if (stats && stats.categoryStats) {
          // Mapear por nombre de categoría a ID
          for (const categoryName of Object.keys(stats.categoryStats)) {
            const categoryStat = stats.categoryStats[categoryName];
            // Buscar la categoría por nombre en la lista de categorías
            const category = categoriesList.find(cat => cat.name === categoryName);
            if (category) {
              // Verificar si hay progreso guardado en la base de datos
              let currentProgress = categoryStat.total;
              let totalQuestions = categoryStat.totalQuestions || 0;
              
              try {
                const progressResult = await QuizProgressService.getQuizProgress(user.id, category.id);
                if (progressResult.success && progressResult.data && progressResult.data.quiz_progress) {
                  // Si hay progreso guardado, usar el número de pregunta actual
                  currentProgress = progressResult.data.quiz_progress; // Ya viene como número de pregunta (1-based)
                  console.log(`📊 Progreso guardado para ${categoryName}: ${currentProgress}/${totalQuestions}`);
                }
              } catch (error) {
                console.warn('⚠️ Error obteniendo progreso guardado:', error);
              }
              
              statsMap[category.id] = {
                totalAnswers: categoryStat.total,
                correctAnswers: categoryStat.correct,
                successPercentage: categoryStat.total > 0 ? Math.round((categoryStat.correct / categoryStat.total) * 100) : 0,
                questionCount: totalQuestions,
                currentProgress: currentProgress // Progreso actual (incluyendo pausado)
              };
            }
          }
        }
        
        // Actualizar las estadísticas generales del estudiante
        setStudentStats({
          totalAnswered: stats?.totalAnswers || 0,
          correctAnswers: stats?.correctAnswers || 0,
          incorrectAnswers: stats?.incorrectAnswers || 0,
          accuracyPercentage: stats?.accuracyPercentage || 0,
        });
        
        setCategoryPublicationStatus(publicationStatusMap);
        setCategoryStats(statsMap);
      } catch (error) {
        console.error('❌ Error cargando datos de categorías:', error);
      }
    };

    loadCategoryData();
  }, [user?.id, studentId, categoriesList]);


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
            Mis Categorías
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
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <div style={{ fontSize: '18px', color: safeColor('textMuted'), marginBottom: '8px' }}>
                No tienes categorías publicadas
              </div>
              <div style={{ fontSize: '14px', color: safeColor('textMuted'), opacity: 0.7 }}>
                Las categorías aparecerán aquí cuando tu administrador las publique
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              justifyContent: 'center',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {categoriesList.map((category) => {
                const isPublished = categoryPublicationStatus[category.id] || false;
                const stats = categoryStats[category.id] || {
                  totalAnswers: 0,
                  correctAnswers: 0,
                  successPercentage: 0.0,
                  questionCount: 0
                };

                return (
                  <CategoryQuizCard
                    key={category.id}
                    category={{
                      ...category,
                      questionCount: stats.questionCount,
                      completed: stats.currentProgress, // Usar progreso actual (incluyendo pausado)
                      lastScore: null // No mostrar puntuación hasta completar el quiz
                    }}
                    onStartQuiz={() => {
                      if (onNavigate) {
                        onNavigate('category-questions', { category });
                      } else if (onStartQuiz) {
                        onStartQuiz(category.id);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}

      </div>

      {/* Footer con políticas de privacidad */}
      <div style={{
        padding: '16px 24px',
        borderTop: `1px solid ${safeColor('border')}`,
        background: safeColor('dark'),
        textAlign: 'center',
        fontSize: '0.85rem',
        color: safeColor('textSecondary'),
        marginTop: '32px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          © 2025 CarvajalAutoTech. Todos los derechos reservados.
        </p>
        <p style={{ margin: '0' }}>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#privacy-policy';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }}
            style={{
              color: safeColor('primary'),
              textDecoration: 'none',
              borderBottom: `1px solid ${safeColor('primary')}30`,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderBottomColor = safeColor('primary');
              e.target.style.color = safeColor('primary');
            }}
            onMouseLeave={(e) => {
              e.target.style.borderBottomColor = safeColor('primary') + '30';
              e.target.style.color = safeColor('primary');
            }}
          >
            Políticas de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;