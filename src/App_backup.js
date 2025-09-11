import React, { useState, useCallback } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import CustomTextField from './components/CustomTextField';
import CustomButton from './components/CustomButton';
import SupabaseStatus from './components/SupabaseStatus';
import Logo from './components/Logo';
import LoginScreenWrapper from './components/LoginScreenWrapper';
import DemoModeNotification from './components/DemoModeNotification';
import { ValidationUtils } from './utils/validation';
import { AppConstants } from './utils/constants';
import { SvgIcons } from './utils/icons';
import { courseService } from './services/courseService';
import './App.css';

function App() {
  const { user, loading, isAuthenticated, isAdmin, isStudent, signIn, signUp, signOut } = useAuth();

  // Estados para formularios
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Funciones optimizadas para cambios de formulario
  const handleLoginFormChange = useCallback((field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleRegisterFormChange = useCallback((field, value) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  }, []);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentPage, setCurrentPage] = useState('selection');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para CRUD del admin
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  // Estados para CRUD del admin (algunos se usan en componentes específicos)

  // Estados para formularios de admin
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    duration: 30
  });
  const [questionForm, setQuestionForm] = useState({
    question: '',
    courseId: '',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '', isCorrect: false },
      { id: 'b', text: '', isCorrect: false },
      { id: 'c', text: '', isCorrect: false },
      { id: 'd', text: '', isCorrect: false }
    ],
    timeLimit: 60,
    points: 10
  });

  // Efecto para redirección automática cuando el usuario ya está logueado
  React.useEffect(() => {
    if (isAuthenticated && currentPage === 'selection') {
      if (isAdmin) {
        setCurrentPage('admin-dashboard');
      } else if (isStudent) {
        setCurrentPage('student-dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isStudent, currentPage]);

  // Cargar datos cuando el admin accede
  React.useEffect(() => {
    if (isAuthenticated && isAdmin && currentPage === 'admin-dashboard') {
      loadAdminData();
    }
  }, [isAuthenticated, isAdmin, currentPage]);

  // Función para cargar datos del admin
  const loadAdminData = async () => {
    try {
      const [coursesResult, questionsResult, studentsResult] = await Promise.all([
        courseService.getCourses(),
        courseService.getQuestions(),
        courseService.getStudents()
      ]);
      
      if (coursesResult.success) setCourses(coursesResult.data);
      if (questionsResult.success) setQuestions(questionsResult.data);
      if (studentsResult.success) setStudents(studentsResult.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // Animaciones de página (optimizadas para UX)
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.3
  };

  // Función para manejar login
  const handleLogin = async (e) => {
    e.preventDefault();
    const validation = ValidationUtils.validateLoginForm(loginForm.email, loginForm.password);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await signIn(loginForm.email, loginForm.password);
    
    if (result.success) {
      // Limpiar formulario
      setLoginForm({ email: '', password: '' });
      setErrors({});
      
      // Redirigir según el rol del usuario después de un breve delay
      setTimeout(() => {
        if (result.data.user.user_metadata.role === 'admin') {
          setCurrentPage('admin-dashboard');
        } else {
          setCurrentPage('student-dashboard');
        }
      }, 100);
    } else {
      setErrors({ general: result.error });
    }
    
    setIsSubmitting(false);
  };

  // Función para manejar registro
  const handleRegister = async (e) => {
    e.preventDefault();
    const validation = ValidationUtils.validateRegisterForm(registerForm);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await signUp({
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      email: registerForm.email,
      password: registerForm.password
    });
    
    if (result.success) {
      alert('¡Cuenta creada exitosamente! Verifica tu correo electrónico.');
      setCurrentPage('student-login');
      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
      });
    } else {
      setErrors({ general: result.error });
    }
    
    setIsSubmitting(false);
  };

  // Función para manejar logout
  const handleLogout = async () => {
    await signOut();
    setCurrentPage('selection');
    setLoginForm({ email: '', password: '' });
    setRememberMe(false);
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${AppConstants.colors.dark} 0%, ${AppConstants.colors.darkSecondary} 100%)`,
        color: AppConstants.colors.textPrimary
      }}>
        <div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${AppConstants.colors.border}`,
            borderTop: `3px solid ${AppConstants.colors.primary}`,
            borderRadius: '50%'
          }}
        />
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
              flexShrink: 0
            }}>
              👤
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

  // Pantalla de login de estudiante
  const StudentLoginScreen = () => (
    <div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${AppConstants.colors.dark} 0%, ${AppConstants.colors.darkSecondary} 100%)`,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: AppConstants.colors.textPrimary
      }}
    >
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage('selection')}
          style={{
            background: 'none',
            border: 'none',
            color: AppConstants.colors.textPrimary,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Volver
        </motion.button>
        
        <div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: `linear-gradient(135deg, ${AppConstants.colors.primary}, rgba(59, 130, 246, 0.8))`,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px'
          }}>
            👤
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Estudiante
          </h1>
          <p style={{ color: AppConstants.colors.textSecondary }}>
            Inicia sesión para acceder a tus cuestionarios
          </p>
        </div>

        <div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ 
            background: AppConstants.colors.cardBg,
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          {errors.general && (
            <div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${AppConstants.colors.secondary}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: AppConstants.colors.secondary,
                fontSize: '14px'
              }}
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <CustomTextField
              label="Correo electrónico"
              value={loginForm.email}
              onChange={(value) => handleLoginFormChange('email', value)}
              type="email"
              placeholder="tu@correo.com"
              icon="📧"
              error={errors.email}
            />

            <CustomTextField
              label="Contraseña"
              value={loginForm.password}
              onChange={(value) => handleLoginFormChange('password', value)}
              placeholder="Tu contraseña"
              icon="🔒"
              error={errors.password}
              showPasswordToggle
            />

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '24px'
            }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px',
                  accentColor: AppConstants.colors.primary
                }}
              />
              <label htmlFor="rememberMe" style={{ 
                color: AppConstants.colors.textSecondary, 
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Recordarme
              </label>
            </div>

            <CustomButton
              text="Iniciar Sesión"
              onClick={handleLogin}
              isLoading={isSubmitting}
              disabled={!loginForm.email || !loginForm.password || isSubmitting}
              variant="primary"
            />
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: AppConstants.colors.textMuted }}>
              ¿No tienes cuenta?{' '}
              <span 
                onClick={() => setCurrentPage('student-register')}
                style={{ 
                  color: AppConstants.colors.primary, 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                Regístrate aquí
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Pantalla de registro de estudiante
  const StudentRegisterScreen = () => (
    <div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${AppConstants.colors.dark} 0%, ${AppConstants.colors.darkSecondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: AppConstants.colors.textPrimary
      }}
    >
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage('student-login')}
          style={{
            background: 'none',
            border: 'none',
            color: AppConstants.colors.textPrimary,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Volver
        </motion.button>
        
        <div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: `linear-gradient(135deg, ${AppConstants.colors.success}, ${AppConstants.colors.successDark})`,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px'
          }}>
            📝
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Crear Cuenta
          </h1>
          <p style={{ color: AppConstants.colors.textSecondary }}>
            Únete a {AppConstants.appName}
          </p>
        </div>

        <div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ 
            background: AppConstants.colors.cardBg,
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          {errors.general && (
            <div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${AppConstants.colors.secondary}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: AppConstants.colors.secondary,
                fontSize: '14px'
              }}
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <CustomTextField
                  label="Nombre"
                  value={registerForm.firstName}
                  onChange={(value) => handleRegisterFormChange('firstName', value)}
                  placeholder="Tu nombre"
                  icon="👤"
                  error={errors.firstName}
                />
              </div>
              <div style={{ flex: 1 }}>
                <CustomTextField
                  label="Apellido"
                  value={registerForm.lastName}
                  onChange={(value) => handleRegisterFormChange('lastName', value)}
                  placeholder="Tu apellido"
                  icon="👤"
                  error={errors.lastName}
                />
              </div>
            </div>

            <CustomTextField
              label="Correo electrónico"
              value={registerForm.email}
              onChange={(value) => handleRegisterFormChange('email', value)}
              type="email"
              placeholder="tu@correo.com"
              icon="📧"
              error={errors.email}
            />

            <CustomTextField
              label="Contraseña"
              value={registerForm.password}
              onChange={(value) => handleRegisterFormChange('password', value)}
              placeholder={`Mínimo ${AppConstants.minPasswordLength} caracteres`}
              icon="🔒"
              error={errors.password}
              showPasswordToggle
            />

            <CustomTextField
              label="Confirmar contraseña"
              value={registerForm.confirmPassword}
              onChange={(value) => handleRegisterFormChange('confirmPassword', value)}
              placeholder="Repite tu contraseña"
              icon="🔒"
              error={errors.confirmPassword}
              showPasswordToggle
            />

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '24px'
            }}>
              <input
                type="checkbox"
                id="acceptTerms"
                checked={registerForm.acceptTerms}
                onChange={(e) => handleRegisterFormChange('acceptTerms', e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px',
                  accentColor: AppConstants.colors.success
                }}
              />
              <label htmlFor="acceptTerms" style={{ 
                color: AppConstants.colors.textSecondary, 
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Acepto los términos y condiciones
              </label>
            </div>

            {errors.terms && (
              <p style={{ 
                color: AppConstants.colors.secondary, 
                fontSize: '14px',
                margin: '0 0 16px 0'
              }}>
                {errors.terms}
              </p>
            )}

            <CustomButton
              text="Crear Cuenta"
              onClick={handleRegister}
              isLoading={isSubmitting}
              variant="success"
              disabled={!registerForm.acceptTerms || 
                       !registerForm.firstName || 
                       !registerForm.lastName || 
                       !registerForm.email || 
                       !registerForm.password || 
                       !registerForm.confirmPassword || 
                       isSubmitting}
            />
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: AppConstants.colors.textMuted }}>
              ¿Ya tienes cuenta?{' '}
              <span 
                onClick={() => setCurrentPage('student-login')}
                style={{ 
                  color: AppConstants.colors.success, 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                Inicia sesión
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Pantalla de login de administrador
  const AdminLoginScreen = () => (
    <div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${AppConstants.colors.dark} 0%, ${AppConstants.colors.darkSecondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: AppConstants.colors.textPrimary
      }}
    >
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage('selection')}
          style={{
            background: 'none',
            border: 'none',
            color: AppConstants.colors.textPrimary,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Volver
        </motion.button>
        
        <div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: `linear-gradient(135deg, ${AppConstants.colors.secondary}, ${AppConstants.colors.secondaryDark})`,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px'
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Administrador
          </h1>
          <p style={{ color: AppConstants.colors.textSecondary }}>
            Acceso exclusivo para administradores
          </p>
        </div>

        <div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ 
            background: AppConstants.colors.cardBg,
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          {errors.general && (
            <div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${AppConstants.colors.secondary}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: AppConstants.colors.secondary,
                fontSize: '14px'
              }}
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <CustomTextField
              label="Correo electrónico"
              value={loginForm.email}
              onChange={(value) => handleLoginFormChange('email', value)}
              type="email"
              placeholder="admin@carvajaltech.com"
              icon="📧"
              error={errors.email}
            />

            <CustomTextField
              label="Contraseña"
              value={loginForm.password}
              onChange={(value) => handleLoginFormChange('password', value)}
              placeholder="Contraseña de administrador"
              icon="🔒"
              error={errors.password}
              showPasswordToggle
            />

            <CustomButton
              text="Acceder al Sistema"
              onClick={handleLogin}
              isLoading={isSubmitting}
              variant="secondary"
              disabled={!loginForm.email || !loginForm.password || isSubmitting}
            />
          </form>
        </div>
      </div>
    </div>
  );

  // Dashboard de estudiante
  const StudentDashboard = () => (
    <div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${AppConstants.colors.dark} 0%, ${AppConstants.colors.darkSecondary} 100%)`,
        padding: '40px',
        color: AppConstants.colors.textPrimary
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
              ¡Hola, {user?.user_metadata?.first_name || 'Estudiante'}! 👋
            </h1>
            <p style={{ color: AppConstants.colors.textMuted, fontSize: '1.1rem' }}>
              Bienvenido a tu dashboard de estudiante
            </p>
          </div>
          
          <div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CustomButton
              text="Cerrar Sesión"
              onClick={handleLogout}
              variant="secondary"
              fullWidth={false}
              icon="🚪"
            />
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {[
            { title: 'Mis Cuestionarios', icon: SvgIcons.dashboard, color: AppConstants.colors.primary, desc: 'Ver y responder cuestionarios asignados' },
            { title: 'Mis Resultados', icon: '📈', color: AppConstants.colors.success, desc: 'Revisa tu progreso y calificaciones' },
            { title: 'Mi Perfil', icon: SvgIcons.settings, color: AppConstants.colors.warning, desc: 'Gestiona tu información personal' },
          ].map((item, index) => (
            <div
              key={item.title}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5, boxShadow: `0 10px 30px rgba(0, 0, 0, 0.2)` }}
              onClick={() => alert(`Funcionalidad "${item.title}" próximamente...`)}
              style={{
                background: AppConstants.colors.cardBg,
                padding: '24px',
                borderRadius: '16px',
                border: `1px solid ${AppConstants.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>{item.icon}</span>
                <h3 style={{ margin: 0, color: item.color, fontSize: '1.2rem' }}>{item.title}</h3>
              </div>
              <p style={{ color: AppConstants.colors.textSecondary, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Información adicional del dashboard */}
        <div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: '40px',
            background: AppConstants.colors.cardBg,
            padding: '24px',
            borderRadius: '16px',
            border: `1px solid ${AppConstants.colors.border}`,
            textAlign: 'center'
          }}
        >
          <h3 style={{ color: AppConstants.colors.primary, marginBottom: '16px' }}>
            ¡Dashboard de Estudiante Funcionando!
          </h3>
          <p style={{ color: AppConstants.colors.textSecondary, margin: 0 }}>
            Este es el dashboard específico para estudiantes. Las funcionalidades se pueden expandir aquí.
          </p>
        </div>
      </div>
    </div>
  );

  // Dashboard de administrador con CRUD completo
  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
      { id: 'overview', label: 'Resumen', icon: SvgIcons.dashboard },
      { id: 'courses', label: 'Cursos', icon: '📚' },
      { id: 'questions', label: 'Preguntas', icon: '❓' },
      { id: 'students', label: 'Estudiantes', icon: '👥' },
      { id: 'assignments', label: 'Asignaciones', icon: SvgIcons.assignments }
    ];

    return (
      <div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{
          minHeight: '100vh',
          background: `linear-gradient(180deg, ${AppConstants.colors.dark} 0%, ${AppConstants.colors.darkSecondary} 100%)`,
          padding: '20px',
          color: AppConstants.colors.textPrimary
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                Panel de Administración 🛡️
              </h1>
              <p style={{ color: AppConstants.colors.textMuted, fontSize: '1.1rem' }}>
                Gestiona cursos, preguntas y estudiantes
              </p>
            </div>
            
            <div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <CustomButton
                text="Cerrar Sesión"
                onClick={handleLogout}
                variant="secondary"
                fullWidth={false}
                icon="🚪"
              />
            </div>
          </div>

          {/* Tabs de navegación */}
          <div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '30px',
              background: AppConstants.colors.cardBg,
              padding: '8px',
              borderRadius: '12px',
              border: `1px solid ${AppConstants.colors.border}`
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: activeTab === tab.id ? AppConstants.colors.primary : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeTab === tab.id ? 'white' : AppConstants.colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Estado de Supabase */}
          <SupabaseStatus />

          {/* Contenido de las tabs */}
          <div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <AdminOverviewTab courses={courses} questions={questions} students={students} />}
            {activeTab === 'courses' && <CoursesTab courses={courses} setCourses={setCourses} courseForm={courseForm} setCourseForm={setCourseForm} />}
            {activeTab === 'questions' && <QuestionsTab questions={questions} setQuestions={setQuestions} courses={courses} questionForm={questionForm} setQuestionForm={setQuestionForm} />}
            {activeTab === 'students' && <StudentsTab students={students} setStudents={setStudents} />}
            {activeTab === 'assignments' && <AssignmentsTab courses={courses} students={students} />}
          </div>
        </div>
      </div>
    );
  };

  // Componente de resumen del admin
  const AdminOverviewTab = ({ courses, questions, students }) => {
    const stats = [
      {
        title: 'Total Cursos',
        value: courses.length,
        icon: '📚',
        color: AppConstants.colors.primary,
        change: '+2'
      },
      {
        title: 'Total Preguntas',
        value: questions.length,
        icon: '❓',
        color: AppConstants.colors.secondary,
        change: '+5'
      },
      {
        title: 'Estudiantes Activos',
        value: students.length,
        icon: '👥',
        color: AppConstants.colors.success,
        change: '+1'
      },
      {
        title: 'Asignaciones',
        value: courses.reduce((sum, c) => sum + c.assignedStudents.length, 0),
        icon: '📋',
        color: AppConstants.colors.warning,
        change: '+3'
      }
    ];

    return (
      <div>
        {/* Estadísticas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              style={{
                background: AppConstants.colors.cardBg,
                padding: '24px',
                borderRadius: '16px',
                border: `1px solid ${AppConstants.colors.border}`,
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
              <h3 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: stat.color }}>
                {stat.value}
              </h3>
              <p style={{ color: AppConstants.colors.textSecondary, margin: '0 0 8px 0' }}>
                {stat.title}
              </p>
              <span style={{ 
                color: AppConstants.colors.success, 
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {stat.change} esta semana
              </span>
            </div>
          ))}
        </div>

        {/* Cursos recientes */}
        <div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            background: AppConstants.colors.cardBg,
            padding: '24px',
            borderRadius: '16px',
            border: `1px solid ${AppConstants.colors.border}`
          }}
        >
          <h3 style={{ marginBottom: '20px', color: AppConstants.colors.primary }}>
            📚 Cursos Recientes
          </h3>
          {courses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courses.slice(0, 3).map((course) => (
                <div key={course.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: AppConstants.colors.textPrimary }}>
                      {course.title}
                    </h4>
                    <p style={{ margin: 0, color: AppConstants.colors.textMuted, fontSize: '14px' }}>
                      {course.questions.length} preguntas • {course.assignedStudents.length} estudiantes
                    </p>
                  </div>
                  <span style={{ 
                    color: AppConstants.colors.success, 
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {course.duration} min
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: AppConstants.colors.textMuted, textAlign: 'center' }}>
              No hay cursos creados aún
            </p>
          )}
        </div>
      </div>
    );
  };

  // Componente de gestión de cursos
  const CoursesTab = ({ courses, setCourses, courseForm, setCourseForm }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const handleCreateCourse = async () => {
      if (!courseForm.title || !courseForm.description) {
        alert('Por favor completa todos los campos');
        return;
      }

      const result = await courseService.createCourse(courseForm);
      if (result.success) {
        setCourses([...courses, result.data]);
        setCourseForm({ title: '', description: '', duration: 30 });
        setShowForm(false);
        alert('Curso creado exitosamente');
      }
    };

    const handleEditCourse = (course) => {
      setEditingCourse(course);
      setCourseForm({
        title: course.title,
        description: course.description,
        duration: course.duration
      });
      setShowForm(true);
    };

    const handleUpdateCourse = async () => {
      const result = await courseService.updateCourse(editingCourse.id, courseForm);
      if (result.success) {
        setCourses(courses.map(c => c.id === editingCourse.id ? result.data : c));
        setShowForm(false);
        setEditingCourse(null);
        setCourseForm({ title: '', description: '', duration: 30 });
        alert('Curso actualizado exitosamente');
      }
    };

    const handleDeleteCourse = async (courseId) => {
      if (window.confirm('¿Estás seguro de eliminar este curso?')) {
        const result = await courseService.deleteCourse(courseId);
        if (result.success) {
          setCourses(courses.filter(c => c.id !== courseId));
          alert('Curso eliminado exitosamente');
        }
      }
    };

    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: AppConstants.colors.primary }}>📚 Gestión de Cursos</h2>
          <CustomButton
            text={showForm ? "Cancelar" : "Nuevo Curso"}
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingCourse(null);
                setCourseForm({ title: '', description: '', duration: 30 });
              }
            }}
            variant="primary"
            fullWidth={false}
            icon={showForm ? SvgIcons.close : SvgIcons.add}
          />
        </div>

        {showForm && (
          <div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: AppConstants.colors.cardBg,
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid ${AppConstants.colors.border}`,
              marginBottom: '20px'
            }}
          >
            <h3 style={{ marginBottom: '20px', color: AppConstants.colors.primary }}>
              {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </h3>
            
            <CustomTextField
              label="Título del Curso"
              value={courseForm.title}
              onChange={(value) => setCourseForm(prev => ({ ...prev, title: value }))}
              placeholder="Ej: Fundamentos de Programación"
              icon="📚"
            />

            <CustomTextField
              label="Descripción"
              value={courseForm.description}
              onChange={(value) => setCourseForm(prev => ({ ...prev, description: value }))}
              placeholder="Describe el contenido del curso"
              icon="📝"
            />

            <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  color: AppConstants.colors.textSecondary,
                  fontSize: '14px'
                }}>
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: AppConstants.colors.inputBg,
                    border: `2px solid ${AppConstants.colors.border}`,
                    borderRadius: '12px',
                    color: AppConstants.colors.textPrimary,
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <CustomButton
                text={editingCourse ? "Actualizar" : "Crear"}
                onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                variant="success"
                fullWidth={false}
                icon={editingCourse ? "💾" : "➕"}
              />
            </div>
          </div>
        )}

        {/* Lista de cursos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: AppConstants.colors.cardBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${AppConstants.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: AppConstants.colors.textPrimary }}>
                  {course.title}
                </h4>
                <p style={{ margin: '0 0 8px 0', color: AppConstants.colors.textSecondary, fontSize: '14px' }}>
                  {course.description}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: AppConstants.colors.textMuted }}>
                  <span>📚 {course.questions.length} preguntas</span>
                  <span>👥 {course.assignedStudents.length} estudiantes</span>
                  <span>⏱️ {course.duration} min</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <CustomButton
                  text="Editar"
                  onClick={() => handleEditCourse(course)}
                  variant="outline"
                  fullWidth={false}
                  size="small"
                  icon={SvgIcons.edit}
                />
                <CustomButton
                  text="Eliminar"
                  onClick={() => handleDeleteCourse(course.id)}
                  variant="secondary"
                  fullWidth={false}
                  size="small"
                  icon={SvgIcons.delete}
                />
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: AppConstants.colors.textMuted
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <p>No hay cursos creados aún</p>
            <p style={{ fontSize: '14px' }}>Crea tu primer curso para comenzar</p>
          </div>
        )}
      </div>
    );
  };

  // Componente de gestión de preguntas
  const QuestionsTab = ({ questions, setQuestions, courses, questionForm, setQuestionForm }) => {
    const [showForm, setShowForm] = useState(false);

    const handleCreateQuestion = async () => {
      if (!questionForm.question || !questionForm.courseId) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      const hasCorrectAnswer = questionForm.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        alert('Debes marcar al menos una respuesta como correcta');
        return;
      }

      const result = await courseService.createQuestion(questionForm);
      if (result.success) {
        setQuestions([...questions, result.data]);
        setQuestionForm({
          question: '',
          courseId: '',
          type: 'multiple_choice',
          options: [
            { id: 'a', text: '', isCorrect: false },
            { id: 'b', text: '', isCorrect: false },
            { id: 'c', text: '', isCorrect: false },
            { id: 'd', text: '', isCorrect: false }
          ],
          timeLimit: 60,
          points: 10
        });
        setShowForm(false);
        alert('Pregunta creada exitosamente');
      }
    };

    const handleDeleteQuestion = async (questionId) => {
      if (window.confirm('¿Estás seguro de eliminar esta pregunta?')) {
        const result = await courseService.deleteQuestion(questionId);
        if (result.success) {
          setQuestions(questions.filter(q => q.id !== questionId));
          alert('Pregunta eliminada exitosamente');
        }
      }
    };

    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: AppConstants.colors.primary }}>❓ Gestión de Preguntas</h2>
          <CustomButton
            text={showForm ? "Cancelar" : "Nueva Pregunta"}
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setQuestionForm({
                  question: '',
                  courseId: '',
                  type: 'multiple_choice',
                  options: [
                    { id: 'a', text: '', isCorrect: false },
                    { id: 'b', text: '', isCorrect: false },
                    { id: 'c', text: '', isCorrect: false },
                    { id: 'd', text: '', isCorrect: false }
                  ],
                  timeLimit: 60,
                  points: 10
                });
              }
            }}
            variant="primary"
            fullWidth={false}
            icon={showForm ? SvgIcons.close : SvgIcons.add}
          />
        </div>

        {showForm && (
          <div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: AppConstants.colors.cardBg,
              padding: '24px',
              borderRadius: '16px',
              border: `1px solid ${AppConstants.colors.border}`,
              marginBottom: '20px'
            }}
          >
            <h3 style={{ marginBottom: '20px', color: AppConstants.colors.primary }}>
              Crear Nueva Pregunta
            </h3>
            
            <CustomTextField
              label="Pregunta"
              value={questionForm.question}
              onChange={(value) => setQuestionForm(prev => ({ ...prev, question: value }))}
              placeholder="Escribe tu pregunta aquí"
              icon="❓"
            />

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: AppConstants.colors.textSecondary,
                fontSize: '14px'
              }}>
                Curso
              </label>
              <select
                value={questionForm.courseId}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, courseId: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: AppConstants.colors.inputBg,
                  border: `2px solid ${AppConstants.colors.border}`,
                  borderRadius: '12px',
                  color: AppConstants.colors.textPrimary,
                  fontSize: '16px',
                  outline: 'none'
                }}
              >
                <option value="">Selecciona un curso</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                color: AppConstants.colors.textSecondary,
                fontSize: '14px'
              }}>
                Opciones de Respuesta
              </label>
              {questionForm.options.map((option, index) => (
                <div key={option.id} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) => {
                      const newOptions = [...questionForm.options];
                      newOptions[index].isCorrect = e.target.checked;
                      setQuestionForm(prev => ({ ...prev, options: newOptions }));
                    }}
                    style={{ 
                      width: '18px', 
                      height: '18px',
                      accentColor: AppConstants.colors.primary
                    }}
                  />
                  <span style={{ 
                    color: AppConstants.colors.textSecondary,
                    fontWeight: '500',
                    minWidth: '20px'
                  }}>
                    {option.id.toUpperCase()})
                  </span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...questionForm.options];
                      newOptions[index].text = e.target.value;
                      setQuestionForm(prev => ({ ...prev, options: newOptions }));
                    }}
                    placeholder={`Opción ${option.id.toUpperCase()}`}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: AppConstants.colors.inputBg,
                      border: `1px solid ${AppConstants.colors.border}`,
                      borderRadius: '8px',
                      color: AppConstants.colors.textPrimary,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  color: AppConstants.colors.textSecondary,
                  fontSize: '14px'
                }}>
                  Tiempo límite (segundos)
                </label>
                <input
                  type="number"
                  value={questionForm.timeLimit}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: AppConstants.colors.inputBg,
                    border: `2px solid ${AppConstants.colors.border}`,
                    borderRadius: '12px',
                    color: AppConstants.colors.textPrimary,
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  color: AppConstants.colors.textSecondary,
                  fontSize: '14px'
                }}>
                  Puntos
                </label>
                <input
                  type="number"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: AppConstants.colors.inputBg,
                    border: `2px solid ${AppConstants.colors.border}`,
                    borderRadius: '12px',
                    color: AppConstants.colors.textPrimary,
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <CustomButton
                text="Crear Pregunta"
                onClick={handleCreateQuestion}
                variant="success"
                fullWidth={true}
                icon="➕"
              />
            </div>
          </div>
        )}

        {/* Lista de preguntas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((question) => {
            const course = courses.find(c => c.id === question.courseId);
            return (
              <div
                key={question.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: AppConstants.colors.cardBg,
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1px solid ${AppConstants.colors.border}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: AppConstants.colors.textPrimary }}>
                      {question.question}
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: AppConstants.colors.textMuted, fontSize: '14px' }}>
                      📚 {course?.title || 'Curso no encontrado'}
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {question.options.map((option) => (
                        <div key={option.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          padding: '4px 8px',
                          background: option.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(75, 85, 99, 0.1)',
                          borderRadius: '6px',
                          border: `1px solid ${option.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(75, 85, 99, 0.3)'}`
                        }}>
                          <span style={{ 
                            color: option.isCorrect ? AppConstants.colors.success : AppConstants.colors.textMuted,
                            fontWeight: '500',
                            fontSize: '12px'
                          }}>
                            {option.id.toUpperCase()})
                          </span>
                          <span style={{ 
                            color: option.isCorrect ? AppConstants.colors.success : AppConstants.colors.textSecondary,
                            fontSize: '14px'
                          }}>
                            {option.text}
                          </span>
                          {option.isCorrect && (
                            <span style={{ 
                              color: AppConstants.colors.success,
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              ✓ Correcta
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      marginTop: '12px',
                      fontSize: '12px', 
                      color: AppConstants.colors.textMuted 
                    }}>
                      <span>⏱️ {question.timeLimit}s</span>
                      <span>⭐ {question.points} pts</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    <CustomButton
                      text="Eliminar"
                      onClick={() => handleDeleteQuestion(question.id)}
                      variant="secondary"
                      fullWidth={false}
                      size="small"
                      icon={SvgIcons.delete}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: AppConstants.colors.textMuted
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❓</div>
            <p>No hay preguntas creadas aún</p>
            <p style={{ fontSize: '14px' }}>Crea tu primera pregunta para comenzar</p>
          </div>
        )}
      </div>
    );
  };

  // Componente de gestión de estudiantes
  const StudentsTab = ({ students, setStudents }) => {
    const handleDeleteStudent = async (studentId) => {
      if (window.confirm('¿Estás seguro de eliminar este estudiante?')) {
        const result = await courseService.deleteStudent(studentId);
        if (result.success) {
          setStudents(students.filter(s => s.id !== studentId));
          alert('Estudiante eliminado exitosamente');
        }
      }
    };

    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: AppConstants.colors.primary }}>👥 Gestión de Estudiantes</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {students.map((student) => (
            <div
              key={student.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: AppConstants.colors.cardBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${AppConstants.colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: AppConstants.colors.textPrimary }}>
                  {student.firstName} {student.lastName}
                </h4>
                <p style={{ margin: '0 0 8px 0', color: AppConstants.colors.textSecondary, fontSize: '14px' }}>
                  📧 {student.email}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: AppConstants.colors.textMuted }}>
                  <span>📚 {student.enrolledCourses.length} cursos</span>
                  <span>✅ {student.completedQuizzes.length} completados</span>
                  <span>⭐ {student.totalScore} puntos</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <CustomButton
                  text="Eliminar"
                  onClick={() => handleDeleteStudent(student.id)}
                  variant="secondary"
                  fullWidth={false}
                  size="small"
                  icon={SvgIcons.delete}
                />
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: AppConstants.colors.textMuted
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <p>No hay estudiantes registrados</p>
            <p style={{ fontSize: '14px' }}>Los estudiantes aparecerán aquí cuando se registren</p>
          </div>
        )}
      </div>
    );
  };

  // Componente de asignaciones
  const AssignmentsTab = ({ courses, students }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');

    const handleAssignCourse = async () => {
      if (!selectedCourse || !selectedStudent) {
        alert('Por favor selecciona un curso y un estudiante');
        return;
      }

      const result = await courseService.assignCourseToStudent(selectedCourse, selectedStudent);
      if (result.success) {
        alert('Curso asignado exitosamente');
        setSelectedCourse('');
        setSelectedStudent('');
      }
    };

    return (
      <div>
        <h2 style={{ margin: '0 0 20px 0', color: AppConstants.colors.primary }}>📋 Asignaciones</h2>
        
        <div
          style={{
            background: AppConstants.colors.cardBg,
            padding: '24px',
            borderRadius: '16px',
            border: `1px solid ${AppConstants.colors.border}`,
            marginBottom: '20px'
          }}
        >
          <h3 style={{ marginBottom: '20px', color: AppConstants.colors.primary }}>
            Asignar Curso a Estudiante
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: AppConstants.colors.textSecondary,
                fontSize: '14px'
              }}>
                Curso
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: AppConstants.colors.inputBg,
                  border: `2px solid ${AppConstants.colors.border}`,
                  borderRadius: '12px',
                  color: AppConstants.colors.textPrimary,
                  fontSize: '16px',
                  outline: 'none'
                }}
              >
                <option value="">Selecciona un curso</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: AppConstants.colors.textSecondary,
                fontSize: '14px'
              }}>
                Estudiante
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: AppConstants.colors.inputBg,
                  border: `2px solid ${AppConstants.colors.border}`,
                  borderRadius: '12px',
                  color: AppConstants.colors.textPrimary,
                  fontSize: '16px',
                  outline: 'none'
                }}
              >
                <option value="">Selecciona un estudiante</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <CustomButton
            text="Asignar Curso"
            onClick={handleAssignCourse}
            variant="success"
            fullWidth={true}
            icon="📋"
          />
        </div>

        {/* Lista de asignaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: AppConstants.colors.cardBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${AppConstants.colors.border}`
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', color: AppConstants.colors.textPrimary }}>
                📚 {course.title}
              </h4>
              <p style={{ margin: '0 0 12px 0', color: AppConstants.colors.textSecondary, fontSize: '14px' }}>
                {course.assignedStudents.length} estudiantes asignados
              </p>
              
              {course.assignedStudents.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {course.assignedStudents.map(studentId => {
                    const student = students.find(s => s.id === studentId);
                    return student ? (
                      <span key={studentId} style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: AppConstants.colors.primary,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        👤 {student.firstName} {student.lastName}
                      </span>
                    ) : null;
                  })}
                </div>
              ) : (
                <p style={{ color: AppConstants.colors.textMuted, fontSize: '14px', margin: 0 }}>
                  No hay estudiantes asignados a este curso
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar página actual
  const renderCurrentPage = () => {
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
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <LoginSelectionScreen />;
    }
  };

  return (
    <div className="App">
      {/* <DemoModeNotification /> */}
      {renderCurrentPage()}
    </div>
  );
}

export default App;