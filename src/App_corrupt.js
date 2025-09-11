import React, { useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import CustomButton from './components/CustomButton';
import LoginScreenWrapper from './components/LoginScreenWrapper';
import SupabaseStatus from './components/SupabaseStatus';
import StudentStatsCard from './components/StudentStatsCard';
import CategoryQuizCard from './components/CategoryQuizCard';
import QuizScreen from './components/QuizScreen';
import QuizResultScreen from './components/QuizResultScreen';
import StudentDashboard from './components/StudentDashboard';
import { AppConstants } from './utils/constants';
import { SvgIcons } from './utils/icons';
import { categoryService } from './services/CategoryService';
import './App.css';

function App() {
  const { user, loading, signOut } = useAuth();

  // Estados para formularios
  const [rememberMe, setRememberMe] = useState(false);
  const [currentPage, setCurrentPage] = useState('selection');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para admin dashboard
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseForm, setCourseForm] = useState({ name: '', description: '' });
  const [questionForm, setQuestionForm] = useState({ 
    text: '', 
    options: ['', '', '', ''], 
    correctAnswer: 0, 
    courseId: '', 
    timeLimit: 30 
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Estados para student dashboard
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [studentView, setStudentView] = useState('dashboard'); // 'dashboard', 'quiz', 'results'
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [quizResults, setQuizResults] = useState(null);

  // Cargar datos del admin - simplificado para evitar re-renders
  const loadAdminData = useCallback(async () => {
    try {
      // Datos de ejemplo para evitar problemas con Supabase
      setCourses([]);
      setQuestions([]);
      setStudents([]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, []);

  // Cargar categorías para estudiantes
  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const response = await categoryService.getActiveCategories();
      if (response.success) {
        setCategories(response.data);
      } else {
        console.error('Error cargando categorías:', response.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Cargar datos al montar el componente - solo una vez
  React.useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      loadAdminData();
    } else if (user?.user_metadata?.role === 'student') {
      loadCategories();
    }
  }, [user, loadAdminData, loadCategories]);

  // Función de logout
  const handleLogout = async () => {
    await signOut();
    setCurrentPage('selection');
    setRememberMe(false);
    setStudentView('dashboard');
    setSelectedCategoryId(null);
    setQuizResults(null);
  };

  // Funciones para navegación del estudiante
  const handleStartQuiz = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setStudentView('quiz');
  };

  const handleQuizFinish = (results) => {
    setQuizResults(results);
    setStudentView('results');
  };

  const handleQuizRetry = () => {
    setStudentView('quiz');
  };

  const handleBackToDashboard = () => {
    setStudentView('dashboard');
    setSelectedCategoryId(null);
    setQuizResults(null);
  };

  const handleQuizExit = () => {
    setStudentView('dashboard');
    setSelectedCategoryId(null);
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: AppConstants.colors.dark,
        color: AppConstants.colors.textPrimary
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${AppConstants.colors.border}`,
            borderTop: `3px solid ${AppConstants.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Pantalla de selección
  const LoginSelectionScreen = () => (
    <LoginScreenWrapper logoPosition="center">
        <h1
          style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}
        >
          ¡Bienvenido!
        </h1>
        
        <p
          style={{ fontSize: '1.125rem', color: AppConstants.colors.textMuted, marginBottom: '60px', textAlign: 'center' }}
        >
          Selecciona tu tipo de acceso
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          width: '100%',
          maxWidth: '100%'
        }}>
          <div
            onClick={() => setCurrentPage('student-login')}
            style={{
              background: `linear-gradient(135deg, ${AppConstants.colors.cardBg}, rgba(31, 41, 55, 0.8))`,
              border: `2px solid rgba(59, 130, 246, 0.3)`,
              borderRadius: '20px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              minHeight: '60px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${AppConstants.colors.primary}, ${AppConstants.colors.primaryDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
              color: 'white'
            }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: '0 0 4px 0' }}>
                Estudiante
              </h3>
              <p style={{ fontSize: '0.85rem', color: AppConstants.colors.textMuted, margin: 0, lineHeight: 1.3 }}>
                Responde cuestionarios y ve tus resultados
              </p>
            </div>
            <span style={{ fontSize: '20px', color: AppConstants.colors.border }}>→</span>
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}
          >
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${AppConstants.colors.border}, transparent)` }}></div>
            <span style={{ color: AppConstants.colors.border, fontWeight: '500', margin: '0 16px', fontSize: '14px' }}>o</span>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${AppConstants.colors.border}, transparent)` }}></div>
          </div>

          <div
            onClick={() => setCurrentPage('admin-login')}
            style={{
              background: `linear-gradient(135deg, ${AppConstants.colors.cardBg}, rgba(31, 41, 55, 0.8))`,
              border: `2px solid rgba(239, 68, 68, 0.3)`,
              borderRadius: '20px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              minHeight: '60px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${AppConstants.colors.secondary}, ${AppConstants.colors.secondaryDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0
            }}>
              {SvgIcons.admin}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: '0 0 4px 0' }}>
                Administrador
              </h3>
              <p style={{ fontSize: '0.85rem', color: AppConstants.colors.textMuted, margin: 0, lineHeight: 1.3 }}>
                Gestiona preguntas y ve estadísticas
              </p>
            </div>
            <span style={{ fontSize: '20px', color: AppConstants.colors.border }}>→</span>
          </div>
        </div>

        <div
          style={{ marginTop: '40px' }}
        >
          <p style={{ color: AppConstants.colors.border, fontSize: '0.875rem', margin: 0 }}>
            {AppConstants.appName} v{AppConstants.version}
          </p>
        </div>
    </LoginScreenWrapper>
  );

  // Pantalla de registro de estudiante
  const StudentRegisterScreen = () => (
    <LoginScreenWrapper logoPosition="center">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: AppConstants.colors.textPrimary,
          marginBottom: '8px'
        }}>
          Crear Cuenta
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: AppConstants.colors.textSecondary,
          margin: 0
        }}>
          Regístrate como estudiante para acceder a los cuestionarios
        </p>
      </div>

      <RegisterForm 
        onSuccess={(formData) => {
          console.log('Registro exitoso:', formData);
          setCurrentPage('student-login');
        }}
        onError={(error) => {
          console.error('Error en registro:', error);
        }}
      />

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <p style={{ fontSize: '14px', color: AppConstants.colors.textMuted }}>
          ¿Ya tienes cuenta?{' '}
          <span 
            onClick={() => setCurrentPage('student-login')}
            style={{ 
              color: AppConstants.colors.primary, 
              cursor: 'pointer', 
              textDecoration: 'underline',
              fontWeight: '500'
            }}
          >
            Inicia sesión aquí
          </span>
        </p>
      </div>
    </LoginScreenWrapper>
  );

  // Pantalla de login de administrador
  const AdminLoginScreen = () => (
    <LoginScreenWrapper logoPosition="center">
      {/* Solo logo arriba - se elimina cabecera con iconos y títulos */}

      <div style={{ 
        background: AppConstants.colors.inputBg,
        padding: '36px',
        borderRadius: '18px',
        marginBottom: '28px',
        boxShadow: '0 10px 36px rgba(0, 0, 0, 0.12)'
      }}>
        <LoginForm 
          isAdmin={true}
          onSuccess={(formData) => {
            console.log('Login admin exitoso:', formData);
            setCurrentPage('admin-dashboard');
          }}
          onError={(error) => {
            console.error('Error en login admin:', error);
          }}
        />

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => alert('Contacta al super administrador para recuperar tu contraseña')}
            style={{
              background: 'none',
              border: 'none',
              color: AppConstants.colors.primary,
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button
          type="button"
          onClick={() => setCurrentPage('selection')}
          style={{
            background: 'none',
            border: 'none',
            color: AppConstants.colors.textMuted,
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
          }}
        >
          ← Volver a la selección
        </button>
      </div>
    </LoginScreenWrapper>
  );

  // Pantalla de login de estudiante
  const StudentLoginScreen = () => (
    <LoginScreenWrapper logoPosition="center">
      {/* Solo logo arriba - se elimina cabecera con iconos y títulos */}

      <div style={{ 
        background: AppConstants.colors.inputBg,
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <LoginForm 
          isAdmin={false}
          onSuccess={(formData) => {
            console.log('Login estudiante exitoso:', formData);
            setCurrentPage('student-dashboard');
          }}
          onError={(error) => {
            console.error('Error en login estudiante:', error);
          }}
        />

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: AppConstants.colors.textMuted, fontSize: '14px', margin: '0 0 10px 0' }}>
            ¿No tienes cuenta?
          </p>
          <button
            type="button"
            onClick={() => setCurrentPage('student-register')}
            style={{
              background: 'none',
              border: 'none',
              color: AppConstants.colors.primary,
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Regístrate aquí
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button
          type="button"
          onClick={() => setCurrentPage('selection')}
          style={{
            background: 'none',
            border: 'none',
            color: AppConstants.colors.textMuted,
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
          }}
        >
          ← Volver a la selección
        </button>
      </div>
    </LoginScreenWrapper>
  );

  // Dashboard de estudiante
  const StudentDashboardComponent = () => {
    // Datos simulados del estudiante
    const studentStats = {
      totalAnswered: 45,
      correctAnswers: 38,
      incorrectAnswers: 7,
      accuracyPercentage: 84.4,
      streak: 5,
    };

    return (
      <StudentDashboard
        user={user}
        categories={categories}
        isLoadingCategories={isLoadingCategories}
        studentStats={studentStats}
        onLogout={handleLogout}
        onStartQuiz={handleStartQuiz}
      />
    );
  };

  // Función para renderizar la vista actual del estudiante
  const renderStudentView = () => {
    switch (studentView) {
      case 'quiz':
        return (
          <QuizScreen
            categoryId={selectedCategoryId}
            onFinish={handleQuizFinish}
            onExit={handleQuizExit}
          />
        );
      case 'results':
        return (
          <QuizResultScreen
            results={quizResults}
            onRetry={handleQuizRetry}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      default:
        return <StudentDashboardComponent />;
    }
  };

  // Dashboard de administrador
  const AdminDashboard = () => {
    return (
      <div style={{
        minHeight: '100vh',
        background: AppConstants.colors.primaryBlack,
        color: AppConstants.colors.white,
        padding: '24px'
      }}>
        <h1>Panel de Administración</h1>
        <p>Funcionalidad de administrador próximamente</p>
      </div>
    );
  };

  // Renderizar página actual
  const renderCurrentPage = () => {
    // Si el usuario está autenticado, mostrar dashboard según rol
    if (user) {
      if (user.user_metadata?.role === 'student') {
        return renderStudentView();
      } else if (user.user_metadata?.role === 'admin') {
        return <AdminDashboard />;
      }
    }

    // Proteger rutas según autenticación y rol
    switch (currentPage) {
      case 'selection':
        return <LoginSelectionScreen />;
      case 'student-login':
        return <StudentLoginScreen />;
      case 'student-register':
        return <StudentRegisterScreen />;
      case 'admin-login':
        return <AdminLoginScreen />;
      default:
        return <LoginSelectionScreen />;
    }
  };

  return (
    <div className="App">
      <SupabaseStatus />
      {renderCurrentPage()}
    </div>
  );
}

export default App;
              margin: 0
            }}>
              Mi Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: AppConstants.colors.info,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '18px' }}>👤</span>
              </div>
              <CustomButton
                onClick={handleLogout}
                text="Cerrar Sesión"
                variant="secondary"
                size="small"
                icon="🚪"
                fullWidth={false}
                style={{
                  background: `${AppConstants.colors.secondary}20`,
                  border: `1px solid ${AppConstants.colors.secondary}40`,
                  color: AppConstants.colors.secondary
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
            background: `linear-gradient(135deg, ${AppConstants.colors.info}, ${AppConstants.colors.info}CC)`,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: `0 6px 12px ${AppConstants.colors.info}4D`
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: `${AppConstants.colors.white}33`,
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
                Racha de {studentStats.streak} días
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
          {[
            { title: 'Cursos Activos', value: '3', icon: '📚', color: AppConstants.colors.primary, change: '+1 este mes' },
            { title: 'Cuestionarios Completados', value: '12', icon: '✅', color: AppConstants.colors.success, change: '+3 esta semana' },
            { title: 'Puntuación Promedio', value: '87%', icon: '📊', color: AppConstants.colors.warning, change: '+5% vs mes anterior' },
            { title: 'Días de Estudio', value: '24', icon: '📅', color: AppConstants.colors.info, change: 'Racha actual' },
          ].map((stat, index) => (
            <div
              key={stat.title}
              style={{
                background: AppConstants.colors.cardBg,
                padding: '28px',
                borderRadius: '16px',
                border: `1px solid ${AppConstants.colors.border}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${stat.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: `${stat.color}10`,
                borderRadius: '50%'
              }}></div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginRight: '16px',
                  border: `1px solid ${stat.color}30`
                }}>
                  {stat.icon}
                </div>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.1rem', 
                    fontWeight: '600',
                    color: AppConstants.colors.textSecondary,
                    marginBottom: '4px'
                  }}>
                    {stat.title}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '2rem', 
                    fontWeight: '700',
                    color: stat.color
                  }}>
                    {stat.value}
                  </p>
                </div>
              </div>
              <p style={{ 
                color: AppConstants.colors.success, 
                margin: 0,
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Main Action Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {[
            { 
              title: 'Mis Cursos', 
              icon: '📚', 
              color: AppConstants.colors.primary, 
              desc: 'Accede a tus cursos asignados y continúa tu aprendizaje',
              action: 'Ver Cursos',
              progress: 75
            },
            { 
              title: 'Cuestionarios', 
              icon: '📝', 
              color: AppConstants.colors.success, 
              desc: 'Responde cuestionarios y ve tus resultados detallados',
              action: 'Comenzar Quiz',
              progress: 60
            },
            { 
              title: 'Mi Perfil', 
              icon: SvgIcons.settings, 
              color: AppConstants.colors.warning, 
              desc: 'Gestiona tu información personal y preferencias',
              action: 'Editar Perfil',
              progress: 90
            },
          ].map((item, index) => (
            <div
              key={item.title}
              style={{
                background: AppConstants.colors.cardBg,
                padding: '32px',
                borderRadius: '20px',
                border: `1px solid ${AppConstants.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 20px 60px ${item.color}15`;
                e.currentTarget.style.borderColor = `${item.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = AppConstants.colors.border;
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                background: `${item.color}08`,
                borderRadius: '50%'
              }}></div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '20px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: `${item.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginRight: '20px',
                  border: `2px solid ${item.color}30`
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.4rem', 
                    fontWeight: '700',
                    color: AppConstants.colors.textPrimary,
                    marginBottom: '4px'
                  }}>
                    {item.title}
                  </h3>
                  <div style={{
                    width: '60px',
                    height: '4px',
                    background: `${item.color}40`,
                    borderRadius: '2px',
                    marginBottom: '8px'
                  }}></div>
                </div>
              </div>
              
              <p style={{ 
                color: AppConstants.colors.textSecondary, 
                margin: '0 0 24px 0',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                {item.desc}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <span style={{
                  color: AppConstants.colors.textMuted,
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  Progreso: {item.progress}%
                </span>
                <button 
                  onClick={() => {
                    if (item.title === 'Mis Cursos') {
                      alert('Funcionalidad de cursos próximamente');
                    } else if (item.title === 'Cuestionarios') {
                      alert('Funcionalidad de cuestionarios próximamente');
                    } else if (item.title === 'Mi Perfil') {
                      alert('Funcionalidad de perfil próximamente');
                    }
                  }}
                  style={{
                    background: `${item.color}20`,
                    color: item.color,
                    border: `1px solid ${item.color}40`,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '28px'
                  }}
                >
                  {item.action}
                </button>
              </div>

              <div style={{
                width: '100%',
                height: '6px',
                background: `${AppConstants.colors.border}50`,
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${item.progress}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: AppConstants.colors.cardBg,
            padding: '32px',
            borderRadius: '20px',
            border: `1px solid ${AppConstants.colors.border}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '150px',
            height: '150px',
            background: `${AppConstants.colors.primary}08`,
            borderRadius: '50%'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ 
              marginBottom: '24px', 
              color: AppConstants.colors.textPrimary,
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: AppConstants.colors.primary,
                borderRadius: '50%'
              }}></span>
              Actividad Reciente
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {[
                { action: 'Completaste el cuestionario "Mecánica Básica"', time: 'Hace 2 horas', score: '95%' },
                { action: 'Nuevo curso asignado: "Sistemas Eléctricos"', time: 'Ayer', score: null },
                { action: 'Actualizaste tu perfil', time: 'Hace 3 días', score: null },
              ].map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: `${AppConstants.colors.primary}05`,
                  borderRadius: '12px',
                  border: `1px solid ${AppConstants.colors.primary}10`
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: AppConstants.colors.primary,
                    borderRadius: '50%',
                    marginRight: '16px',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      margin: '0 0 4px 0', 
                      color: AppConstants.colors.textPrimary,
                      fontWeight: '500'
                    }}>
                      {activity.action}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      color: AppConstants.colors.textMuted,
                      fontSize: '0.9rem'
                    }}>
                      {activity.time}
                    </p>
                  </div>
                  {activity.score && (
                    <div style={{
                      background: `${AppConstants.colors.success}20`,
                      color: AppConstants.colors.success,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {activity.score}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard de administrador
  const AdminDashboard = () => {
    const tabs = [
      { id: 'overview', label: 'Resumen', icon: SvgIcons.dashboard },
      { id: 'courses', label: 'Cursos', icon: SvgIcons.courses },
      { id: 'questions', label: 'Preguntas', icon: SvgIcons.questions },
      { id: 'students', label: 'Estudiantes', icon: SvgIcons.students },
      { id: 'assignments', label: 'Asignaciones', icon: SvgIcons.assignments }
    ];

    return (
      <div
        style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${AppConstants.colors.dark} 0%, ${AppConstants.colors.darkSecondary} 100%)`,
          color: AppConstants.colors.textPrimary,
          padding: '24px'
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header con gradiente */}
          <div style={{ 
            background: `linear-gradient(135deg, ${AppConstants.colors.secondary}20, ${AppConstants.colors.secondaryDark}10)`,
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '32px',
            border: `1px solid ${AppConstants.colors.secondary}30`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${AppConstants.colors.secondary}20, transparent)`,
              borderRadius: '50%'
            }}></div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <div>
                <h1 style={{ 
                  fontSize: '2.8rem', 
                  marginBottom: '8px',
                  background: `linear-gradient(135deg, ${AppConstants.colors.textPrimary}, ${AppConstants.colors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '700'
                }}>
                  Panel de Administración
                </h1>
                <p style={{ 
                  color: AppConstants.colors.textMuted, 
                  fontSize: '1.2rem',
                  margin: 0
                }}>
                  Gestiona el sistema educativo completo
                </p>
              </div>
              
              <CustomButton
                onClick={handleLogout}
                text="Cerrar Sesión"
                variant="secondary"
                size="small"
                icon="🚪"
                fullWidth={false}
                style={{
                  background: `${AppConstants.colors.secondary}20`,
                  border: `1px solid ${AppConstants.colors.secondary}40`,
                  color: AppConstants.colors.secondary
                }}
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {[
              { title: 'Total Estudiantes', value: '156', icon: '👥', color: AppConstants.colors.primary, change: '+12 este mes' },
              { title: 'Cursos Activos', value: '8', icon: '📚', color: AppConstants.colors.success, change: '+2 nuevos' },
              { title: 'Preguntas', value: '342', icon: '❓', color: AppConstants.colors.warning, change: '+28 esta semana' },
              { title: 'Cuestionarios', value: '45', icon: '📝', color: AppConstants.colors.info, change: '+5 completados' },
            ].map((stat, index) => (
              <div
                key={stat.title}
                style={{
                  background: AppConstants.colors.cardBg,
                  padding: '24px',
                  borderRadius: '16px',
                  border: `1px solid ${AppConstants.colors.border}`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${stat.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: `${stat.color}10`,
                  borderRadius: '50%'
                }}></div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '12px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginRight: '12px',
                    border: `1px solid ${stat.color}30`
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      fontWeight: '600',
                      color: AppConstants.colors.textSecondary,
                      marginBottom: '4px'
                    }}>
                      {stat.title}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '1.8rem', 
                      fontWeight: '700',
                      color: stat.color
                    }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                <p style={{ 
                  color: AppConstants.colors.success, 
                  margin: 0,
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Tabs de navegación mejoradas */}
          <div
            style={{
              background: AppConstants.colors.cardBg,
              borderRadius: '16px',
              padding: '8px',
              marginBottom: '24px',
              border: `1px solid ${AppConstants.colors.border}`,
              display: 'flex',
              gap: '4px'
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? AppConstants.colors.primary : 'transparent',
                  color: activeTab === tab.id ? 'white' : AppConstants.colors.textSecondary,
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  flex: 1,
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = `${AppConstants.colors.primary}20`;
                    e.currentTarget.style.color = AppConstants.colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = AppConstants.colors.textSecondary;
                  }
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido de las tabs */}
          <div style={{
            background: AppConstants.colors.cardBg,
            borderRadius: '20px',
            padding: '32px',
            border: `1px solid ${AppConstants.colors.border}`,
            minHeight: '400px'
          }}>
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  marginBottom: '24px',
                  color: AppConstants.colors.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    background: AppConstants.colors.primary,
                    borderRadius: '50%'
                  }}></span>
                  Resumen del Sistema
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  <div style={{
                    padding: '24px',
                    background: `${AppConstants.colors.primary}10`,
                    borderRadius: '12px',
                    border: `1px solid ${AppConstants.colors.primary}20`
                  }}>
                    <h4 style={{ color: AppConstants.colors.primary, marginBottom: '12px' }}>Actividad Reciente</h4>
                    <p style={{ color: AppConstants.colors.textSecondary, margin: 0 }}>
                      Sistema funcionando correctamente. Última actualización hace 2 horas.
                    </p>
                  </div>
                  <div style={{
                    padding: '24px',
                    background: `${AppConstants.colors.success}10`,
                    borderRadius: '12px',
                    border: `1px solid ${AppConstants.colors.success}20`
                  }}>
                    <h4 style={{ color: AppConstants.colors.success, marginBottom: '12px' }}>Estado del Sistema</h4>
                    <p style={{ color: AppConstants.colors.textSecondary, margin: 0 }}>
                      Todos los servicios operativos. Base de datos conectada.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'courses' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: AppConstants.colors.textPrimary }}>
                  Gestión de Cursos
                </h3>
                <p style={{ color: AppConstants.colors.textSecondary, marginBottom: '24px' }}>
                  Aquí podrás crear, editar y gestionar todos los cursos del sistema.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <button
                    onClick={() => alert('Funcionalidad de crear curso próximamente')}
                    style={{
                      background: `${AppConstants.colors.primary}20`,
                      color: AppConstants.colors.primary,
                      border: `1px solid ${AppConstants.colors.primary}40`,
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ➕ Crear Nuevo Curso
                  </button>
                  <button
                    onClick={() => alert('Funcionalidad de ver cursos próximamente')}
                    style={{
                      background: `${AppConstants.colors.success}20`,
                      color: AppConstants.colors.success,
                      border: `1px solid ${AppConstants.colors.success}40`,
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📚 Ver Todos los Cursos
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'questions' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: AppConstants.colors.textPrimary }}>
                  Gestión de Preguntas
                </h3>
                <p style={{ color: AppConstants.colors.textSecondary, marginBottom: '24px' }}>
                  Crea y administra las preguntas para los cuestionarios.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <button
                    onClick={() => alert('Funcionalidad de crear pregunta próximamente')}
                    style={{
                      background: `${AppConstants.colors.primary}20`,
                      color: AppConstants.colors.primary,
                      border: `1px solid ${AppConstants.colors.primary}40`,
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ➕ Crear Nueva Pregunta
                  </button>
                  <button
                    onClick={() => alert('Funcionalidad de ver preguntas próximamente')}
                    style={{
                      background: `${AppConstants.colors.success}20`,
                      color: AppConstants.colors.success,
                      border: `1px solid ${AppConstants.colors.success}40`,
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ❓ Ver Todas las Preguntas
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'students' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: AppConstants.colors.textPrimary }}>
                  Gestión de Estudiantes
                </h3>
                <p style={{ color: AppConstants.colors.textSecondary, marginBottom: '24px' }}>
                  Administra los estudiantes registrados y sus progresos.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <button
                    onClick={() => alert('Funcionalidad de ver estudiantes próximamente')}
                    style={{
                      background: `${AppConstants.colors.primary}20`,
                      color: AppConstants.colors.primary,
                      border: `1px solid ${AppConstants.colors.primary}40`,
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    👥 Ver Todos los Estudiantes
                  </button>
                  <button
                    onClick={() => alert('Funcionalidad de estadísticas próximamente')}
                    style={{
                      background: `${AppConstants.colors.success}20`,
                      color: AppConstants.colors.success,
                      border: `1px solid ${AppConstants.colors.success}40`,
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📊 Ver Estadísticas
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'assignments' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: AppConstants.colors.textPrimary }}>
                  Gestión de Asignaciones
                </h3>
                <p style={{ color: AppConstants.colors.textSecondary, marginBottom: '24px' }}>
                  Asigna cursos y cuestionarios a los estudiantes.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <button
                    onClick={() => alert('Funcionalidad de asignar cursos próximamente')}
                    style={{
                      background: `${AppConstants.colors.primary}20`,
                      color: AppConstants.colors.primary,
                      border: `1px solid ${AppConstants.colors.primary}40`,
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📝 Asignar Cursos
                  </button>
                  <button
                    onClick={() => alert('Funcionalidad de asignar cuestionarios próximamente')}
                    style={{
                      background: `${AppConstants.colors.success}20`,
                      color: AppConstants.colors.success,
                      border: `1px solid ${AppConstants.colors.success}40`,
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📋 Asignar Cuestionarios
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar página actual
  const renderCurrentPage = () => {
    // Si el usuario está autenticado, mostrar dashboard según rol
    if (user) {
      if (user.user_metadata?.role === 'student') {
        return renderStudentView();
      } else if (user.user_metadata?.role === 'admin') {
        return <AdminDashboard />;
      }
    }

    // Proteger rutas según autenticación y rol
    switch (currentPage) {
      case 'selection':
        return <LoginSelectionScreen />;
      case 'student-login':
        return <StudentLoginScreen />;
      case 'student-register':
        return <StudentRegisterScreen />;
      case 'admin-login':
        return <AdminLoginScreen />;
      default:
        return <LoginSelectionScreen />;
    }
  };

  return (
    <div className="App">
      <SupabaseStatus />
      {renderCurrentPage()}
    </div>
  );
}

export default App;
