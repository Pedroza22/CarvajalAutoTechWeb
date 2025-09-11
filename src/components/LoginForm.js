import React, { useRef, useState } from 'react';
import { AppConstants } from '../utils/constants';
import { ValidationUtils } from '../utils/validation';
import CustomButton from './CustomButton';

const LoginForm = ({ onSuccess, onError, isAdmin = false }) => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    // Validaciones
    const validationResult = ValidationUtils.validateLoginForm(email, password);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simular login exitoso por ahora
      setTimeout(() => {
        setIsSubmitting(false);
        if (onSuccess) {
          onSuccess({ email, password });
        }
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      if (onError) {
        onError(error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: errors.email ? AppConstants.colors.secondary : AppConstants.colors.textSecondary
        }}>
          {isAdmin ? 'Correo de administrador' : 'Correo electrónico'} *
        </label>
        <input
          ref={emailRef}
          type="email"
          placeholder={isAdmin ? "admin@sistema.com" : "tu@correo.com"}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            background: AppConstants.colors.inputBg,
            border: '2px solid',
            borderColor: errors.email ? AppConstants.colors.secondary : AppConstants.colors.border,
            borderRadius: '12px',
            color: AppConstants.colors.textPrimary,
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        {errors.email && (
          <p style={{ color: AppConstants.colors.secondary, fontSize: '14px', margin: '6px 0 0 0' }}>
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: errors.password ? AppConstants.colors.secondary : AppConstants.colors.textSecondary
        }}>
          {isAdmin ? 'Contraseña de administrador' : 'Contraseña'} *
        </label>
        <input
          ref={passwordRef}
          type="password"
          placeholder={isAdmin ? "Tu contraseña segura" : "Tu contraseña"}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            background: AppConstants.colors.inputBg,
            border: '2px solid',
            borderColor: errors.password ? AppConstants.colors.secondary : AppConstants.colors.border,
            borderRadius: '12px',
            color: AppConstants.colors.textPrimary,
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        {errors.password && (
          <p style={{ color: AppConstants.colors.secondary, fontSize: '14px', margin: '6px 0 0 0' }}>
            {errors.password}
          </p>
        )}
      </div>

      {!isAdmin && (
        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => alert('Funcionalidad próximamente')}
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
      )}

      <CustomButton
        type="submit"
        text={isSubmitting ? (isAdmin ? 'Accediendo...' : 'Iniciando sesión...') : (isAdmin ? 'Acceder al Sistema' : 'Iniciar Sesión')}
        variant="primary"
        disabled={isSubmitting}
        style={{ marginTop: '16px' }}
      />
    </form>
  );
};

export default LoginForm;

