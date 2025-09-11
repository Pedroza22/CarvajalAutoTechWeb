import React, { useRef, useState } from 'react';
import { AppConstants } from '../utils/constants';
import { ValidationUtils } from '../utils/validation';
import CustomButton from './CustomButton';

const RegisterForm = ({ onSuccess, onError }) => {
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const acceptTermsRef = useRef(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Obtener valores de los inputs
    const formData = {
      firstName: firstNameRef.current?.value || '',
      lastName: lastNameRef.current?.value || '',
      email: emailRef.current?.value || '',
      password: passwordRef.current?.value || '',
      confirmPassword: confirmPasswordRef.current?.value || '',
      acceptTerms: acceptTermsRef.current?.checked || false
    };

    // Validaciones
    const validationResult = ValidationUtils.validateRegisterForm(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simular registro exitoso por ahora
      setTimeout(() => {
        setIsSubmitting(false);
        if (onSuccess) {
          onSuccess(formData);
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: errors.firstName ? AppConstants.colors.secondary : AppConstants.colors.textSecondary
          }}>
            Nombre *
          </label>
          <input
            ref={firstNameRef}
            type="text"
            placeholder="Tu nombre"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: AppConstants.colors.inputBg,
              border: '2px solid',
              borderColor: errors.firstName ? AppConstants.colors.secondary : AppConstants.colors.border,
              borderRadius: '12px',
              color: AppConstants.colors.textPrimary,
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {errors.firstName && (
            <p style={{ color: AppConstants.colors.secondary, fontSize: '14px', margin: '6px 0 0 0' }}>
              {errors.firstName}
            </p>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: errors.lastName ? AppConstants.colors.secondary : AppConstants.colors.textSecondary
          }}>
            Apellido *
          </label>
          <input
            ref={lastNameRef}
            type="text"
            placeholder="Tu apellido"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: AppConstants.colors.inputBg,
              border: '2px solid',
              borderColor: errors.lastName ? AppConstants.colors.secondary : AppConstants.colors.border,
              borderRadius: '12px',
              color: AppConstants.colors.textPrimary,
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {errors.lastName && (
            <p style={{ color: AppConstants.colors.secondary, fontSize: '14px', margin: '6px 0 0 0' }}>
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: errors.email ? AppConstants.colors.secondary : AppConstants.colors.textSecondary
        }}>
          Correo electrónico *
        </label>
        <input
          ref={emailRef}
          type="email"
          placeholder="tu@email.com"
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
          Contraseña *
        </label>
        <input
          ref={passwordRef}
          type="password"
          placeholder="Mínimo 6 caracteres"
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

      <div>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: errors.confirmPassword ? AppConstants.colors.secondary : AppConstants.colors.textSecondary
        }}>
          Confirmar contraseña *
        </label>
        <input
          ref={confirmPasswordRef}
          type="password"
          placeholder="Repite tu contraseña"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: AppConstants.colors.inputBg,
            border: '2px solid',
            borderColor: errors.confirmPassword ? AppConstants.colors.secondary : AppConstants.colors.border,
            borderRadius: '12px',
            color: AppConstants.colors.textPrimary,
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        {errors.confirmPassword && (
          <p style={{ color: AppConstants.colors.secondary, fontSize: '14px', margin: '6px 0 0 0' }}>
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <input
          ref={acceptTermsRef}
          type="checkbox"
          id="acceptTerms"
          style={{
            width: '18px',
            height: '18px',
            accentColor: AppConstants.colors.primary
          }}
        />
        <label htmlFor="acceptTerms" style={{
          fontSize: '14px',
          color: AppConstants.colors.textSecondary,
          cursor: 'pointer'
        }}>
          Acepto los{' '}
          <span style={{
            color: AppConstants.colors.primary,
            textDecoration: 'underline',
            cursor: 'pointer'
          }}>
            términos y condiciones
          </span>
        </label>
      </div>
      {errors.terms && (
        <p style={{ color: AppConstants.colors.secondary, fontSize: '14px', margin: 0 }}>
          {errors.terms}
        </p>
      )}

      <CustomButton
        type="submit"
        text={isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
        variant="primary"
        disabled={isSubmitting}
        style={{ marginTop: '16px' }}
      />
    </form>
  );
};

export default RegisterForm;
