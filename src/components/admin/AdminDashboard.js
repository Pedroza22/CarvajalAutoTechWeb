import React, { useState } from 'react';
import { getColor } from '../../utils/constants';
import AdminStudentsListPage from './AdminStudentsListPage';
import AdminStudentDetailPage from './AdminStudentDetailPage';
import AdminCategoriesPage from './AdminCategoriesPage';
import AdminQuestionsPage from './AdminQuestionsPage';
import AdminStatisticsPage from './AdminStatisticsPage';

const AdminDashboard = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageData, setPageData] = useState(null);

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students-list', label: 'Estudiantes', icon: '👥' },
    { id: 'categories', label: 'Categorías', icon: '📂' },
    { id: 'questions', label: 'Preguntas', icon: '❓' },
    { id: 'statistics', label: 'Estadísticas', icon: '📈' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome onNavigate={handleNavigate} />;
      case 'students-list':
        return <AdminStudentsListPage onNavigate={handleNavigate} />;
      case 'student-detail':
        return <AdminStudentDetailPage onNavigate={handleNavigate} student={pageData?.student} />;
      case 'categories':
        return <AdminCategoriesPage onNavigate={handleNavigate} />;
      case 'questions':
        return <AdminQuestionsPage onNavigate={handleNavigate} />;
      case 'statistics':
        return <AdminStatisticsPage onNavigate={handleNavigate} />;
      default:
        return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      color: safeColor('textPrimary'),
      fontFamily: 'Arial, sans-serif',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: safeColor('cardBg'),
        borderRight: `1px solid ${safeColor('border')}`,
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{
          padding: '0 24px 32px 24px',
          borderBottom: `1px solid ${safeColor('border')}33`
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: safeColor('primary'),
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🎓 Admin Panel
          </h1>
        </div>

        {/* Menu */}
        <nav style={{
          flex: 1,
          padding: '24px 0'
        }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              style={{
                width: '100%',
                background: currentPage === item.id ? safeColor('primary') + '20' : 'transparent',
                color: currentPage === item.id ? safeColor('primary') : safeColor('textMuted'),
                border: 'none',
                padding: '16px 24px',
                fontSize: '1rem',
                fontWeight: currentPage === item.id ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.target.style.background = safeColor('border') + '20';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{
          padding: '24px',
          borderTop: `1px solid ${safeColor('border')}33`
        }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              background: safeColor('error'),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto'
      }}>
        {renderPage()}
      </div>
    </div>
  );
};

// Componente para el dashboard principal
const DashboardHome = ({ onNavigate }) => {
  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const quickStats = [
    { label: 'Estudiantes Activos', value: '150', icon: '👥', color: safeColor('primary') },
    { label: 'Preguntas Totales', value: '250', icon: '❓', color: safeColor('success') },
    { label: 'Categorías', value: '8', icon: '📂', color: safeColor('warning') },
    { label: 'Quizzes Completados', value: '45', icon: '📊', color: safeColor('error') }
  ];

  const quickActions = [
    { 
      label: 'Ver Estudiantes', 
      description: 'Gestionar lista de estudiantes',
      icon: '👥',
      action: () => onNavigate('students-list')
    },
    { 
      label: 'Gestionar Categorías', 
      description: 'Crear y editar categorías',
      icon: '📂',
      action: () => onNavigate('categories')
    },
    { 
      label: 'Crear Preguntas', 
      description: 'Agregar nuevas preguntas',
      icon: '❓',
      action: () => onNavigate('questions')
    },
    { 
      label: 'Ver Estadísticas', 
      description: 'Analizar rendimiento',
      icon: '📈',
      action: () => onNavigate('statistics')
    }
  ];

  return (
    <div style={{
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: safeColor('textPrimary'),
          margin: '0 0 8px 0'
        }}>
          Panel de Administración
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: safeColor('textMuted'),
          margin: 0
        }}>
          Bienvenido al sistema de gestión educativa
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {quickStats.map((stat, index) => (
          <div key={index} style={{
            background: safeColor('cardBg'),
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${safeColor('border')}`,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '12px'
            }}>
              {stat.icon}
            </div>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: stat.color,
              margin: '0 0 8px 0'
            }}>
              {stat.value}
            </h3>
            <p style={{
              fontSize: '1rem',
              color: safeColor('textMuted'),
              margin: 0
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginBottom: '40px'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '600',
          color: safeColor('textPrimary'),
          margin: '0 0 24px 0'
        }}>
          Acciones Rápidas
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              style={{
                background: safeColor('cardBg'),
                border: `1px solid ${safeColor('border')}`,
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = safeColor('primary') + '10';
                e.target.style.borderColor = safeColor('primary');
              }}
              onMouseLeave={(e) => {
                e.target.style.background = safeColor('cardBg');
                e.target.style.borderColor = safeColor('border');
              }}
            >
              <div style={{
                fontSize: '2rem'
              }}>
                {action.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  margin: '0 0 8px 0'
                }}>
                  {action.label}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: safeColor('textMuted'),
                  margin: 0
                }}>
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${safeColor('border')}`
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '600',
          color: safeColor('textPrimary'),
          margin: '0 0 20px 0'
        }}>
          📈 Actividad Reciente
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {[
            { action: 'Nuevo estudiante registrado', user: 'Juan Pérez', time: 'Hace 2 horas', icon: '👤' },
            { action: 'Quiz completado', user: 'María García', time: 'Hace 3 horas', icon: '✅' },
            { action: 'Nueva pregunta creada', user: 'Admin', time: 'Hace 5 horas', icon: '➕' },
            { action: 'Categoría actualizada', user: 'Admin', time: 'Ayer', icon: '📂' }
          ].map((activity, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: safeColor('dark'),
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '1.5rem'
              }}>
                {activity.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1rem',
                  color: safeColor('textPrimary'),
                  marginBottom: '4px'
                }}>
                  {activity.action}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: safeColor('textMuted')
                }}>
                  {activity.user} • {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
