import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './CustomButton.css';

interface CustomButtonProps {
  text: string;
  onClick?: () => void;
  isLoading?: boolean;
  isOutlined?: boolean;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
  gradient?: string[];
  width?: string | number;
  height?: string | number;
  padding?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onClick,
  isLoading = false,
  isOutlined = false,
  icon,
  backgroundColor,
  textColor,
  gradient,
  width,
  height = '56px',
  padding,
  disabled = false,
  type = 'button'
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const isEnabled = !disabled && !isLoading && onClick;

  const handleMouseDown = () => {
    if (isEnabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (isEnabled && onClick) {
      onClick();
    }
  };

  const getButtonStyle = () => {
    const baseStyle: React.CSSProperties = {
      width: width || '100%',
      height,
      padding,
    };

    if (isOutlined) {
      return {
        ...baseStyle,
        background: 'transparent',
        borderColor: isEnabled 
          ? (gradient ? '#ef4444' : backgroundColor || '#ef4444')
          : '#4b5563',
      };
    }

    if (gradient && gradient.length >= 2) {
      return {
        ...baseStyle,
        background: isEnabled 
          ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
          : 'linear-gradient(135deg, #4b5563, rgba(75, 85, 99, 0.8))',
      };
    }

    return {
      ...baseStyle,
      backgroundColor: isEnabled 
        ? backgroundColor || '#ef4444'
        : '#4b5563',
    };
  };

  const getTextColor = () => {
    if (isOutlined) {
      return isEnabled 
        ? '#ef4444'
        : '#9ca3af';
    }
    return textColor || '#ffffff';
  };

  const getShadow = () => {
    if (!isOutlined && isEnabled) {
      const shadowColor = gradient ? '#ef4444' : backgroundColor || '#ef4444';
      return `0 6px 12px ${shadowColor}30`;
    }
    return 'none';
  };

  return (
    <motion.button
      type={type}
      className={`custom-button ${isOutlined ? 'outlined' : 'filled'} ${!isEnabled ? 'disabled' : ''}`}
      style={{
        ...getButtonStyle(),
        boxShadow: getShadow(),
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={!isEnabled}
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        scale: isPressed ? 0.95 : 1,
        opacity: isPressed ? 0.8 : 1,
      }}
      transition={{
        duration: 0.15,
        ease: 'easeInOut'
      }}
      whileHover={isEnabled ? { scale: 1.02 } : {}}
      whileTap={isEnabled ? { scale: 0.95 } : {}}
    >
      <div className="button-content">
        {isLoading ? (
          <div className="loading-spinner">
            <motion.div
              className={`spinner ${isOutlined ? 'outlined-spinner' : 'filled-spinner'}`}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>
        ) : (
          <>
            {icon && (
              <motion.i
                className={`button-icon icon-${icon}`}
                style={{ color: getTextColor() }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              />
            )}
            <span 
              className="button-text"
              style={{ color: getTextColor() }}
            >
              {text}
            </span>
          </>
        )}
      </div>
    </motion.button>
  );
};

export default CustomButton;
