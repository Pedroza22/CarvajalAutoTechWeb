import React, { useEffect, useState } from 'react';
import { AppTheme } from '../../utils/appTheme';
import QuickActionCard from './QuickActionCard';
import StatisticsService from '../../services/StatisticsService';

const AdminHomePage = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('Admin');
  const [loadingDisplayName, setLoadingDisplayName] = useState(true);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalStudents: 0,
    totalCategories: 0,
    totalAnswers: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar estadísticas
        const res = await StatisticsService.getAdminStats();
        const systemStats = res?.systemStats || {};
        setStats({
          totalQuestions: systemStats.total_questions || 0,
          totalStudents: systemStats.total_students || 0,
          totalCategories: systemStats.total_categories || 0,
          totalAnswers: systemStats.total_answers || 0,
        });

        // Cargar nombre del usuario (simulado por ahora)
        setDisplayName('Admin');
        setLoadingDisplayName(false);
      } catch (e) {
        console.warn('No se pudieron cargar estadísticas admin:', e);
        setDisplayName('Admin');
        setLoadingDisplayName(false);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const welcomeSectionStyle = {
    width: '100%',
    padding: '24px',
    background: AppTheme.gradients.primary,
    borderRadius: '20px',
    boxShadow: AppTheme.shadows.primary,
    marginBottom: '24px',
  };

  const welcomeContentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const avatarStyle = {
    width: '60px',
    height: '60px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const avatarIconStyle = {
    color: AppTheme.white,
    fontSize: '30px',
  };

  const welcomeTextStyle = {
    flex: 1,
  };

  const welcomeTitleStyle = {
    color: AppTheme.white,
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '4px',
    lineHeight: '1.2',
  };

  const welcomeSubtitleStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '16px',
    fontWeight: '400',
    marginBottom: '0',
  };

  const lastActivityStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: '400',
    marginTop: '16px',
  };

  const quickActionsTitleStyle = {
    color: AppTheme.white,
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
  };

  const quickActionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  };

  // Responsive styles
  const responsiveStyles = {
    container: {
      padding: window.innerWidth <= 768 ? '12px' : '16px',
    },
    welcomeSection: {
      padding: window.innerWidth <= 768 ? '20px' : '24px',
      marginBottom: window.innerWidth <= 768 ? '20px' : '24px',
    },
    welcomeContent: {
      flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
      alignItems: window.innerWidth <= 480 ? 'center' : 'flex-start',
      textAlign: window.innerWidth <= 480 ? 'center' : 'left',
    },
    avatar: {
      width: window.innerWidth <= 480 ? '50px' : '60px',
      height: window.innerWidth <= 480 ? '50px' : '60px',
      marginBottom: window.innerWidth <= 480 ? '12px' : '0',
    },
    quickActionsGrid: {
      gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : 'repeat(2, 1fr)',
      gap: window.innerWidth <= 480 ? '12px' : '16px',
    },
    statsGrid: {
      gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : 
                          window.innerWidth <= 768 ? 'repeat(2, 1fr)' :
                          'repeat(4, 1fr)',
      gap: window.innerWidth <= 480 ? '12px' : '16px',
    },
  };

  const quickActions = [
    {
      title: 'Crear Pregunta',
      subtitle: 'Nueva pregunta',
      icon: '➕',
      color: AppTheme.success,
      onTap: () => onNavigate('admin-create-question'),
    },
    {
      title: 'Ver Preguntas',
      subtitle: 'Gestionar todas',
      icon: '❓',
      color: AppTheme.info,
      onTap: () => onNavigate('admin-questions'),
    },
    {
      title: 'Categorías',
      subtitle: 'Organizar temas',
      icon: '📁',
      color: AppTheme.warning,
      onTap: () => onNavigate('admin-categories'),
    },
    {
      title: 'Estadísticas',
      subtitle: 'Ver reportes',
      icon: '📊',
      color: AppTheme.primaryRed,
      onTap: () => onNavigate('admin-stats'),
    },
  ];

  return (
    <div style={{ ...responsiveStyles.container, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Sección de Bienvenida - EXACTA del móvil */}
      <div style={{ ...welcomeSectionStyle, ...responsiveStyles.welcomeSection }}>
        <div style={{ ...welcomeContentStyle, ...responsiveStyles.welcomeContent }}>
          <div style={{ ...avatarStyle, ...responsiveStyles.avatar }}>
            <span style={avatarIconStyle}>🛡️</span>
          </div>
          <div style={welcomeTextStyle}>
            <div style={welcomeTitleStyle}>
              ¡Bienvenido, {loadingDisplayName ? 'Cargando...' : displayName}!
            </div>
            <div style={welcomeSubtitleStyle}>
              Gestiona el sistema desde aquí
            </div>
          </div>
        </div>
        <div style={lastActivityStyle}>
          Última actividad: Hace 2 minutos
        </div>
      </div>

      {/* Sección de Acciones Rápidas - EXACTA del móvil */}
      <div>
        <div style={quickActionsTitleStyle}>
          Acciones Rápidas
        </div>
        <div style={{ ...quickActionsGridStyle, ...responsiveStyles.quickActionsGrid }}>
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              color={action.color}
              onTap={action.onTap}
            />
          ))}
        </div>
      </div>

      {/* Estadísticas rápidas (opcional, como en el móvil) */}
      {stats.totalQuestions > 0 && (
        <div style={{
          ...AppTheme.card(),
          padding: window.innerWidth <= 768 ? '16px' : '20px',
          marginBottom: '24px',
        }}>
          <div style={{
            color: AppTheme.white,
            fontSize: window.innerWidth <= 768 ? '16px' : '18px',
            fontWeight: '600',
            marginBottom: '16px',
          }}>
            Resumen del Sistema
          </div>
          <div style={{
            display: 'grid',
            ...responsiveStyles.statsGrid,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: AppTheme.white, 
                fontSize: window.innerWidth <= 768 ? '20px' : '24px', 
                fontWeight: '700' 
              }}>
                {stats.totalQuestions}
              </div>
              <div style={{ color: AppTheme.greyLight, fontSize: '12px' }}>
                Preguntas
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: AppTheme.white, 
                fontSize: window.innerWidth <= 768 ? '20px' : '24px', 
                fontWeight: '700' 
              }}>
                {stats.totalStudents}
              </div>
              <div style={{ color: AppTheme.greyLight, fontSize: '12px' }}>
                Estudiantes
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: AppTheme.white, 
                fontSize: window.innerWidth <= 768 ? '20px' : '24px', 
                fontWeight: '700' 
              }}>
                {stats.totalCategories}
              </div>
              <div style={{ color: AppTheme.greyLight, fontSize: '12px' }}>
                Categorías
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: AppTheme.white, 
                fontSize: window.innerWidth <= 768 ? '20px' : '24px', 
                fontWeight: '700' 
              }}>
                {stats.totalAnswers}
              </div>
              <div style={{ color: AppTheme.greyLight, fontSize: '12px' }}>
                Respuestas
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHomePage;