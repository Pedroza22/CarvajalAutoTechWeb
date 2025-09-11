import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import UnifiedAuthScreen from './components/UnifiedAuthScreen';
import CustomButton from './components/CustomButton';
import LoginScreenWrapper from './components/LoginScreenWrapper';
import Logo from './components/Logo';
import StudentDashboard from './components/StudentDashboard';
import AdminCategoriesPage from './components/AdminCategoriesPage';
import AdminHomePage from './components/admin/AdminHomePage';
import AdminQuestionsListPage from './components/admin/AdminQuestionsListPage';
import AdminStatisticsPage from './components/admin/AdminStatisticsPage';
import AdminStudentsPage from './components/admin/AdminStudentsPage';
import AdminCreateQuestionPage from './components/admin/AdminCreateQuestionPage';
import SupabaseConnectionTest from './components/SupabaseConnectionTest';
import { getColor } from './utils/constants';
import './App.css';
import CategoriesService from './services/CategoriesService';
import StatisticsService from './services/StatisticsService';
import { supabase } from './services/supabase';

function App() {
  const { user, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState('selection');
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [studentStats, setStudentStats] = useState(null);
  const [profile, setProfile] = useState(null);

  // Derivar rol desde metadatos (user_metadata o app_metadata)
  const userRole = useMemo(() => {
    const profileRole = profile?.role; // prefer DB role
    const metaRole = user?.user_metadata?.role || user?.app_metadata?.role;
    return profileRole || metaRole || null;
  }, [user, profile]);

  // Debug logs
  console.log('App render - user:', user, 'loading:', loading, 'role:', userRole, 'currentPage:', currentPage);

  // Forzar que los admins aterricen en el home del panel
  useEffect(() => {
    if (user && userRole === 'admin') {
      if (currentPage === 'admin-auth' || !String(currentPage).startsWith('admin-')) {
        console.log('Redirigiendo admin a admin-home desde:', currentPage);
        setCurrentPage('admin-home');
      }
    }
  }, [user, userRole, currentPage]);
  // Cargar perfil desde user_profiles para obtener rol persistido
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.id) {
          setProfile(null);
          return;
        }
        let { data, error } = await supabase
          .from('user_profiles')
          .select('id, role, first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          // fallback por email si el id no coincide en la tabla
          const byEmail = await supabase
            .from('user_profiles')
            .select('id, role, first_name, last_name, email')
            .eq('email', user.email)
            .maybeSingle();
          data = byEmail.data || null;
        }
        setProfile(data || null);

        // Opcional: sincronizar metadata con el rol del perfil
        if (data?.role && user?.user_metadata?.role !== data.role) {
          try {
            await supabase.auth.updateUser({ data: { role: data.role } });
          } catch (_) {}
        }
      } catch (e) {
        console.warn('No se pudo cargar user_profiles:', e.message);
        setProfile(null);
      }
    };
    loadProfile();
  }, [user]);

  // Cargar datos del dashboard cuando hay usuario estudiante
  useEffect(() => {
    const loadStudentData = async () => {
      if (!user || userRole !== 'student') {
        console.log('🚫 No cargando datos - usuario:', user?.email, 'rol:', userRole);
        return;
      }
      try {
        console.log('🔄 Cargando datos del estudiante...');
        setIsLoadingCategories(true);
        const [cats, stats] = await Promise.all([
          CategoriesService.getActiveCategories(),
          StatisticsService.getDashboardStats(user.id)
        ]);
        console.log('📊 Datos cargados - categorías:', cats?.length, 'stats:', stats);
        setCategories(Array.isArray(cats) ? cats : []);
        setStudentStats(stats || {});
      } catch (e) {
        console.error('❌ Error cargando datos del estudiante:', e);
        setCategories([]);
        setStudentStats({});
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadStudentData();
  }, [user, userRole]);

  // Componente AdminDashboard simplificado
  const AdminDashboard = () => {
    console.log('AdminDashboard renderizando con currentPage:', currentPage);
    return (
    <div style={{
      minHeight: '100vh',
      background: getColor('dark'),
      color: getColor('textPrimary'),
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: getColor('cardBg'),
        borderRadius: '16px',
        padding: '24px 24px 8px',
        border: `1px solid ${getColor('border')}`
      }}>
        {/* Encabezado limpio y profesional */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{
              color: getColor('textPrimary'),
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0
            }}>Panel de Administración</div>
            <div style={{ color: getColor('textMuted'), fontSize: 13, marginTop: 4 }}>Gestiona tu sistema desde aquí</div>
          </div>
          <CustomButton
            text="Cerrar Sesión"
            onClick={signOut}
            variant="secondary"
            size="small"
            fullWidth={false}
          />
        </div>

        {currentPage === 'admin-home' && (
          <AdminHomePage onNavigate={setCurrentPage} />
        )}
        {currentPage === 'admin-categories' && <AdminCategoriesPage onNavigate={setCurrentPage} />}
        {currentPage === 'admin-questions' && <AdminQuestionsListPage onNavigate={setCurrentPage} />}
        {currentPage === 'admin-stats' && <AdminStatisticsPage />}
        {currentPage === 'admin-students' && <AdminStudentsPage />}
        {currentPage === 'admin-create-question' && (
          <AdminCreateQuestionPage onSaved={() => setCurrentPage('admin-questions')} />
        )}
        {currentPage === 'admin-connection-test' && (
          <SupabaseConnectionTest />
        )}
        {!currentPage.startsWith('admin-') && (
          <div style={{ padding: 20, color: getColor('textMuted') }}>
            Página no encontrada: {currentPage}
            <br />
            <CustomButton
              text="Test Conexión Supabase"
              onClick={() => setCurrentPage('admin-connection-test')}
              variant="outline"
              size="small"
              style={{ marginTop: '16px' }}
            />
          </div>
        )}
      </div>
    </div>
    );
  };

  // Renderizar página actual
  const renderCurrentPage = () => {
    console.log('renderCurrentPage - user:', user, 'currentPage:', currentPage);
    
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: getColor('dark'),
          color: getColor('textPrimary')
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${getColor('border')}`,
              borderTop: `3px solid ${getColor('primary')}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p>Cargando...</p>
          </div>
        </div>
      );
    }
    
    // Si el usuario está autenticado, mostrar dashboard según rol
    if (user) {
      if (userRole === 'student') {
        return (
          <StudentDashboard
            user={user}
            categories={categories}
            isLoadingCategories={isLoadingCategories}
            studentStats={{
              totalAnswered: studentStats?.overall?.totalQuestions || 0,
              correctAnswers: studentStats?.overall?.totalCorrect || 0,
              incorrectAnswers: studentStats?.overall?.totalIncorrect || 0,
              accuracyPercentage: studentStats?.overall?.accuracy || 0,
              streak: studentStats?.overall?.streak || 0
            }}
            onLogout={signOut}
            onStartQuiz={(categoryId) => console.log('Start quiz category:', categoryId)}
          />
        );
      } else if (userRole === 'admin') {
        return <AdminDashboard />;
      } else if (currentPage === 'admin-auth') {
        // Usuario autenticado sin rol admin en flujo admin: bloquear y ofrecer salir
        return (
          <div style={{ 
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: getColor('dark'), color: getColor('textPrimary') 
          }}>
            <div style={{ 
              background: getColor('cardBg'), padding: 24, borderRadius: 12, 
              border: `1px solid ${getColor('border')}`
            }}>
              <h2 style={{ marginTop: 0 }}>Acceso denegado</h2>
              <p style={{ color: getColor('textMuted') }}>
                Tu cuenta no tiene permisos de administrador.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <CustomButton text="Cerrar sesión" onClick={signOut} />
                <CustomButton text="Volver" variant="outline" onClick={() => setCurrentPage('selection')} />
              </div>
            </div>
          </div>
        );
      }
    }

    // Proteger rutas según autenticación y rol
    switch (currentPage) {
      case 'selection':
        return (
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '400px', 
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
          }}>
            {/* Logo más grande y centrado */}
            <div style={{ 
              marginBottom: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Logo 
                size="xxlarge" 
                showText={false} 
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
            
            <h1 style={{ 
              color: getColor('textPrimary'), 
              marginBottom: '32px',
              fontSize: '2rem',
              fontWeight: '600'
            }}>
              Bienvenido a Carvajal AutoTech
            </h1>
            <p style={{ 
              color: getColor('textMuted'), 
              marginBottom: '40px',
              fontSize: '1.1rem'
            }}>
              Selecciona tu tipo de usuario
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <CustomButton
                text="Soy Estudiante"
                onClick={() => setCurrentPage('student-auth')}
                icon="🎓"
                style={{
                  background: `linear-gradient(135deg, ${getColor('primary')}, ${getColor('primaryDark')})`,
                  fontSize: '1.1rem',
                  padding: '16px 24px'
                }}
              />
              
              <CustomButton
                text="Soy Administrador"
                onClick={() => setCurrentPage('admin-auth')}
                icon="🛡️"
                style={{
                  background: `linear-gradient(135deg, ${getColor('primary')}, ${getColor('primaryDark')})`,
                  fontSize: '1.1rem',
                  padding: '16px 24px'
                }}
              />

              {/* Eliminado Test Conexión Supabase */}
              
            </div>
          </div>
        );
      case 'student-auth':
        return (
          <UnifiedAuthScreen 
            onSuccess={(user) => {
              console.log('Autenticación exitosa:', user);
            }}
            onBack={() => setCurrentPage('selection')}
          />
        );
      case 'admin-auth':
        return (
          <UnifiedAuthScreen 
            onSuccess={(user) => {
              console.log('Autenticación admin exitosa:', user);
            }}
            onBack={() => setCurrentPage('selection')}
            isAdmin={true}
          />
        );
      case 'connection-test':
        return (
          <div>
            <div style={{ 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: getColor('background'),
              borderBottom: `1px solid ${getColor('border')}`
            }}>
              <CustomButton
                text="← Volver"
                onClick={() => setCurrentPage('selection')}
                variant="outline"
                style={{ marginBottom: '10px' }}
              />
              <h2 style={{ color: getColor('textPrimary'), margin: '10px 0' }}>
                Test de Conexión Supabase
              </h2>
            </div>
            <SupabaseConnectionTest />
          </div>
        );
      default:
        return (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: getColor('textPrimary') }}>Página no encontrada</h2>
            <CustomButton
              text="Volver al inicio"
              onClick={() => setCurrentPage('selection')}
              variant="outline"
            />
          </div>
        );
    }
  };

  return (
    <div className="App">
      <LoginScreenWrapper hideLogoForSelection={currentPage === 'selection'}>
        {renderCurrentPage()}
      </LoginScreenWrapper>
    </div>
  );
}

export default App;