import React, { useState, useRef, useEffect } from 'react';
import { AppTheme } from '../utils/appTheme';

const CustomTextField = ({
  controller,
  label,
  hint,
  validator,
  obscureText = false,
  keyboardType,
  prefixIcon,
  suffixIcon,
  maxLines = 1,
  minLines,
  maxLength,
  enabled = true,
  readOnly = false,
  onTap,
  onChanged,
  onSubmitted,
  focusNode,
  textInputAction,
  focusColor,
  autofocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [value, setValue] = useState(controller?.value || '');
  
  const internalFocusNode = useRef(null);
  const currentFocusNode = focusNode || internalFocusNode.current;

  useEffect(() => {
    if (controller) {
      setValue(controller.value || '');
    }
  }, [controller]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    validateField();
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (controller) {
      controller.value = newValue;
    }
    
    if (onChanged) {
      onChanged(newValue);
    }
    
    // Limpiar error mientras escribe
    if (hasError) {
      setHasError(false);
      setErrorText(null);
    }
  };

  const validateField = () => {
    if (validator) {
      const error = validator(value);
      setHasError(error !== null);
      setErrorText(error);
    }
  };

  const containerStyle = {
    marginBottom: '16px',
  };

  const labelStyle = {
    color: hasError ? AppTheme.error : (isFocused ? (focusColor || AppTheme.primaryRed) : AppTheme.greyLight),
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    paddingLeft: '4px',
    transform: isFocused ? 'scale(0.85)' : 'scale(1)',
    transformOrigin: 'left center',
    transition: 'all 0.2s ease-in-out',
  };

  const inputContainerStyle = {
    position: 'relative',
    borderRadius: AppTheme.borderRadius.medium,
    boxShadow: isFocused 
      ? `0 4px 8px ${(hasError ? AppTheme.error : (focusColor || AppTheme.primaryRed))}33`
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
  };

  const inputStyle = {
    width: '100%',
    padding: maxLines > 1 ? '16px' : '14px 16px',
    background: AppTheme.lightBlack,
    border: `1px solid ${hasError ? AppTheme.error : (isFocused ? (focusColor || AppTheme.primaryRed) : AppTheme.greyDark)}`,
    borderRadius: AppTheme.borderRadius.medium,
    color: AppTheme.white,
    fontSize: '16px',
    fontWeight: '400',
    fontFamily: AppTheme.typography.fontFamily,
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    resize: maxLines > 1 ? 'vertical' : 'none',
    minHeight: maxLines > 1 ? `${maxLines * 24 + 32}px` : '48px',
  };

  const inputDisabledStyle = {
    ...inputStyle,
    background: AppTheme.greyDark,
    color: AppTheme.greyMedium,
    cursor: 'not-allowed',
  };

  const errorContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '6px',
    paddingLeft: '4px',
    opacity: hasError ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out',
  };

  const errorIconStyle = {
    color: AppTheme.error,
    fontSize: '14px',
  };

  const errorTextStyle = {
    color: AppTheme.error,
    fontSize: '12px',
    fontWeight: '400',
  };

  const counterStyle = {
    color: AppTheme.greyMedium,
    fontSize: '11px',
    fontWeight: '400',
    textAlign: 'right',
    marginTop: '4px',
    paddingRight: '4px',
  };

  return (
    <div style={containerStyle}>
      {/* Label animado */}
      <div style={labelStyle}>
        {label}
      </div>
      
      {/* Campo de texto con contenedor animado */}
      <div style={inputContainerStyle}>
        <textarea
          ref={internalFocusNode}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSubmitted) {
              onSubmitted(value);
            }
          }}
          placeholder={hint}
          disabled={!enabled}
          readOnly={readOnly}
          onClick={onTap}
          autoFocus={autofocus}
          maxLength={maxLength}
          rows={maxLines}
          style={enabled ? inputStyle : inputDisabledStyle}
        />
      </div>
      
      {/* Mensaje de error animado */}
      {hasError && errorText && (
        <div style={errorContainerStyle}>
          <span style={errorIconStyle}>⚠️</span>
          <span style={errorTextStyle}>
            {errorText}
          </span>
        </div>
      )}
      
      {/* Contador de caracteres */}
      {maxLength && (
        <div style={counterStyle}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default CustomTextField;