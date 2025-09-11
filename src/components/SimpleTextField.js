import React, { useState } from 'react';
import { AppConstants } from '../utils/constants';

// Componente SimpleTextField sin optimizaciones complejas
const SimpleTextField = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
  error,
  showPasswordToggle = false,
  disabled = false,
  required = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const inputType = showPasswordToggle ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Label */}
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: error ? AppConstants.colors.secondary : 
                isFocused ? AppConstants.colors.primary : 
                AppConstants.colors.textSecondary
        }}
      >
        {label}
        {required && <span style={{ color: AppConstants.colors.secondary }}> *</span>}
      </label>

      {/* Container del input */}
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          value={value || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            padding: '12px 16px',
            paddingLeft: icon ? '44px' : '16px',
            paddingRight: showPasswordToggle ? '44px' : '16px',
            background: disabled ? '#2d3748' : AppConstants.colors.inputBg,
            border: '2px solid',
            borderColor: error ? AppConstants.colors.secondary :
                        isFocused ? AppConstants.colors.primary :
                        AppConstants.colors.border,
            borderRadius: '12px',
            color: AppConstants.colors.textPrimary,
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text'
          }}
        />

        {/* Icono prefijo */}
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              color: error ? AppConstants.colors.secondary :
                    isFocused ? AppConstants.colors.primary :
                    AppConstants.colors.textMuted
            }}
          >
            {icon}
          </div>
        )}

        {/* Toggle de contraseña */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: AppConstants.colors.textMuted,
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p
          style={{
            marginTop: '6px',
            color: AppConstants.colors.secondary,
            fontSize: '14px',
            margin: '6px 0 0 0'
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default SimpleTextField;

