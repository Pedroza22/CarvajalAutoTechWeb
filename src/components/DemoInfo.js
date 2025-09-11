import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppConstants } from '../utils/constants';

const DemoInfo = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: AppConstants.colors.cardBg,
          border: `2px solid ${AppConstants.colors.primary}`,
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '300px',
          zIndex: 1000,
          color: AppConstants.colors.textPrimary,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, color: AppConstants.colors.primary, fontSize: '16px' }}>
            🎯 Modo Demo
          </h4>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              color: AppConstants.colors.textMuted,
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              width: '20px',
              height: '20px'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
          <p style={{ margin: '0 0 12px 0', color: AppConstants.colors.textSecondary }}>
            Usa estas credenciales para probar:
          </p>
          
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            padding: '8px', 
            borderRadius: '6px', 
            marginBottom: '8px',
            border: `1px solid rgba(59, 130, 246, 0.3)`
          }}>
            <strong style={{ color: AppConstants.colors.primary }}>👨‍🎓 Estudiante:</strong><br />
            <code style={{ fontSize: '12px', color: AppConstants.colors.textMuted }}>
              estudiante@test.com<br />
              12345678
            </code>
          </div>
          
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            padding: '8px', 
            borderRadius: '6px',
            border: `1px solid rgba(239, 68, 68, 0.3)`
          }}>
            <strong style={{ color: AppConstants.colors.secondary }}>🛡️ Admin:</strong><br />
            <code style={{ fontSize: '12px', color: AppConstants.colors.textMuted }}>
              admin@test.com<br />
              admin123
            </code>
          </div>
          
          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: AppConstants.colors.textMuted }}>
            También puedes registrar nuevos estudiantes
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoInfo;

