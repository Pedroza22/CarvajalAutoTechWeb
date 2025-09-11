import React, { useState, useRef } from 'react';
import { AppConstants, getColor } from '../utils/constants';
import CustomButton from './CustomButton';
import UncontrolledInput from './UncontrolledInput';
import { useAuth } from '../hooks/useAuth';

const UnifiedAuthScreen = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signIn, signUp } = useAuth();

  // Referencias para los inputs (uncontrolled)
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();

  const validateForm = () => {
    const newErrors = {};
    
    const email = emailRef.current?.value?.trim();
    const password = passwordRef.current?.value?.trim();
    const confirmPassword = confirmPasswordRef.current?.value?.trim();
    const firstName = firstNameRef.current?.value?.trim();
    const lastName = lastNameRef.current?.value?.trim();

    // Validación de email
    if (!email) {
      newErrors.email = AppConstants.validationMessages.emailRequired;
    } else if (!AppConstants.emailRegex.test(email)) {
      newErrors.email = AppConstants.validationMessages.emailInvalid;
    }

    // Validación de contraseña
    if (!password) {
      newErrors.password = AppConstants.validationMessages.passwordRequired;
    } else if (password.length < AppConstants.minPasswordLength) {
      newErrors.password = AppConstants.validationMessages.passwordTooShort;
    }

    // Validaciones específicas para registro
    if (!isLogin) {
      if (!firstName) {
        newErrors.firstName = AppConstants.validationMessages.nameRequired;
      } else if (firstName.length < AppConstants.nameMinLength) {
        newErrors.firstName = AppConstants.validationMessages.nameTooShort;
      }

      if (!lastName) {
        newErrors.lastName = AppConstants.validationMessages.lastNameRequired;
      } else if (lastName.length < AppConstants.nameMinLength) {
        newErrors.lastName = AppConstants.validationMessages.lastNameTooShort;
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = AppConstants.validationMessages.passwordsNoMatch;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const email = emailRef.current.value.trim();
      const password = passwordRef.current.value.trim();

      if (isLogin) {
        // Login
        const result = await signIn(email, password);
        if (result.success) {
          onSuccess(result.user);
        } else {
          setErrors({ general: result.error });
        }
      } else {
        // Registro
        const firstName = firstNameRef.current.value.trim();
        const lastName = lastNameRef.current.value.trim();
        
        const result = await signUp(email, password, firstName, lastName);
        if (result.success) {
          setErrors({ general: '¡Registro exitoso! Ahora puedes iniciar sesión.' });
          setIsLogin(true);
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    // Limpiar los inputs
    if (emailRef.current) emailRef.current.value = '';
    if (passwordRef.current) passwordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    if (firstNameRef.current) firstNameRef.current.value = '';
    if (lastNameRef.current) lastNameRef.current.value = '';
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '32px',
      background: getColor('cardBg'),
      borderRadius: '16px',
      border: `1px solid ${getColor('border')}`,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          margin: '0 0 8px 0',
          color: getColor('textPrimary'),
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>
        <p style={{
          margin: '0',
          color: getColor('textMuted'),
          fontSize: '14px'
        }}>
          {isLogin ? 'Ingresa tus credenciales' : 'Completa tus datos para registrarte'}
        </p>
      </div>

      {/* Error general */}
      {errors.general && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          background: getColor('error') + '20',
          border: `1px solid ${getColor('error')}40`,
          borderRadius: '8px',
          color: getColor('error'),
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {errors.general}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Campos para registro */}
        {!isLogin && (
          <>
            <div style={{ display: 'flex', gap: '12px' }}>
              <UncontrolledInput
                ref={firstNameRef}
                label="Nombre"
                placeholder="Tu nombre"
                required
                error={errors.firstName}
                style={{ flex: 1 }}
              />
              <UncontrolledInput
                ref={lastNameRef}
                label="Apellido"
                placeholder="Tu apellido"
                required
                error={errors.lastName}
                style={{ flex: 1 }}
              />
            </div>
          </>
        )}

        {/* Email */}
        <UncontrolledInput
          ref={emailRef}
          type="email"
          label="Correo Electrónico"
          placeholder="tu@email.com"
          required
          error={errors.email}
        />

        {/* Contraseña */}
        <UncontrolledInput
          ref={passwordRef}
          type="password"
          label="Contraseña"
          placeholder="Tu contraseña"
          required
          error={errors.password}
        />

        {/* Confirmar contraseña (solo en registro) */}
        {!isLogin && (
          <UncontrolledInput
            ref={confirmPasswordRef}
            type="password"
            label="Confirmar Contraseña"
            placeholder="Repite tu contraseña"
            required
            error={errors.confirmPassword}
          />
        )}

        {/* Botón de envío */}
        <CustomButton
          type="submit"
          text={isLoading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          isLoading={isLoading}
          variant="primary"
          fullWidth
          style={{ marginTop: '8px' }}
        />

        {/* Toggle entre login y registro */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <p style={{
            margin: '0',
            color: getColor('textMuted'),
            fontSize: '14px'
          }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: getColor('primary'),
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '4px'
            }}
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
          </button>
        </div>
      </form>

      {/* Botón de volver */}
      {onBack && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: getColor('textMuted'),
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Volver
          </button>
        </div>
      )}
    </div>
  );
};

export default UnifiedAuthScreen;

