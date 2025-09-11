import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CustomTextField.css';

interface CustomTextFieldProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  prefixIcon?: string;
  suffixIcon?: string;
  onSuffixClick?: () => void;
  isPassword?: boolean;
  isPasswordVisible?: boolean;
  keyboardType?: 'text' | 'email' | 'password' | 'number';
  validator?: (value: string) => string | null;
  enabled?: boolean;
  maxLines?: number;
  maxLength?: number;
  error?: string;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  hint,
  value,
  onChange,
  prefixIcon,
  suffixIcon,
  onSuffixClick,
  isPassword = false,
  isPasswordVisible = false,
  keyboardType = 'text',
  validator,
  enabled = true,
  maxLines = 1,
  maxLength,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (error) {
      setHasError(true);
      setValidationError(error);
    } else {
      setHasError(false);
      setValidationError(null);
    }
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (validator) {
      const validationResult = validator(value);
      setValidationError(validationResult);
      setHasError(!!validationResult);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
    
    // Clear error when user starts typing
    if (hasError) {
      setHasError(false);
      setValidationError(null);
    }
  };

  const getInputType = () => {
    if (isPassword) {
      return isPasswordVisible ? 'text' : 'password';
    }
    return keyboardType === 'email' ? 'email' : keyboardType === 'number' ? 'number' : 'text';
  };

  const InputComponent = maxLines > 1 ? 'textarea' : 'input';

  return (
    <motion.div 
      className="custom-text-field"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Label */}
      <motion.label
        className={`field-label ${isFocused || hasError ? 'focused' : ''} ${hasError ? 'error' : ''}`}
        animate={{
          color: hasError ? '#ef4444' : isFocused ? '#ef4444' : '#9ca3af'
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>

      {/* Input Container */}
      <motion.div
        className={`input-container ${isFocused ? 'focused' : ''} ${hasError ? 'error' : ''}`}
        animate={{
          boxShadow: isFocused 
            ? '0 4px 12px rgba(239, 68, 68, 0.1)' 
            : '0 0 0 rgba(0, 0, 0, 0)',
          borderColor: hasError 
            ? '#ef4444' 
            : isFocused 
              ? '#ef4444' 
              : 'rgba(75, 85, 99, 0.5)'
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Prefix Icon */}
        {prefixIcon && (
          <motion.div 
            className="prefix-icon"
            animate={{
              color: isFocused ? '#ef4444' : '#6b7280'
            }}
            transition={{ duration: 0.2 }}
          >
            <i className={`icon-${prefixIcon}`} />
          </motion.div>
        )}

        {/* Input Field */}
        <InputComponent
          ref={inputRef as any}
          type={getInputType()}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={hint}
          disabled={!enabled}
          maxLength={maxLength}
          rows={maxLines > 1 ? maxLines : undefined}
          className="input-field"
        />

        {/* Suffix Icon */}
        {suffixIcon && (
          <motion.button
            type="button"
            className="suffix-icon"
            onClick={onSuffixClick}
            animate={{
              color: isFocused ? '#ef4444' : '#6b7280'
            }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={`icon-${suffixIcon}`} />
          </motion.button>
        )}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {validationError}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomTextField;
