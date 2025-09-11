import React, { useRef, useEffect, forwardRef } from 'react';
import { AppConstants } from '../utils/constants';

const UncontrolledInput = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  required = false,
  defaultValue = '',
  onValueChange,
  style = {}
}, ref) => {
  const inputRef = useRef(null);

  // Usar el ref pasado como prop o el ref interno
  const actualRef = ref || inputRef;

  useEffect(() => {
    if (actualRef.current && defaultValue) {
      actualRef.current.value = defaultValue;
    }
  }, [defaultValue, actualRef]);

  const handleChange = () => {
    if (onValueChange && actualRef.current) {
      onValueChange(actualRef.current.value);
    }
  };

  return (
    <div style={{ marginBottom: '20px', ...style }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: error ? AppConstants.colors.secondary : AppConstants.colors.textSecondary
      }}>
        {label}
        {required && <span style={{ color: AppConstants.colors.secondary }}> *</span>}
      </label>
      
      <input
        ref={actualRef}
        type={type}
        placeholder={placeholder}
        required={required}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: AppConstants.colors.inputBg,
          border: '2px solid',
          borderColor: error ? AppConstants.colors.secondary : AppConstants.colors.border,
          borderRadius: '12px',
          color: AppConstants.colors.textPrimary,
          fontSize: '16px',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      
      {error && (
        <p style={{
          color: AppConstants.colors.secondary,
          fontSize: '14px',
          margin: '6px 0 0 0'
        }}>
          {error}
        </p>
      )}
    </div>
  );
});

UncontrolledInput.displayName = 'UncontrolledInput';

export default UncontrolledInput;
