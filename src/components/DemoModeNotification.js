import React, { useState, useEffect } from 'react';
import { getColor } from '../utils/constants';

const DemoModeNotification = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Verificar si estamos en modo demo
    const checkDemoMode = () => {
      // Buscar en la consola si hay mensajes de modo demo
      const originalLog = console.log;
      console.log = (...args) => {
        const message = args.join(' ');
        if (message.includes('Modo Demo activado')) {
          setIsDemoMode(true);
        }
        originalLog.apply(console, args);
      };
    };

    checkDemoMode();
    
    // También verificar después de un delay
    setTimeout(() => {
      // Si no hay usuario autenticado y no hay errores de Supabase, probablemente es demo
      const hasSupabaseErrors = window.performance.getEntriesByType('navigation')
        .some(entry => entry.name.includes('supabase'));
      
      if (!hasSupabaseErrors) {
        setIsDemoMode(true);
      }
    }, 2000);
  }, []);

  if (!isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: getColor('warning'),
      color: getColor('textPrimary'),
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      maxWidth: '300px',
      border: `1px solid ${getColor('warningDark')}`,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎭</span>
          <strong style={{ fontSize: '14px' }}>Modo Demo</strong>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: getColor('textPrimary'),
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
      
      <p style={{
        margin: '0',
        fontSize: '12px',
        lineHeight: '1.4',
        opacity: 0.9
      }}>
        La aplicación está funcionando en modo demo. 
        Puedes hacer login con cualquier email y contraseña.
      </p>
      
      <div style={{
        marginTop: '8px',
        padding: '6px 8px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}>
        💡 Credenciales de prueba:<br/>
        Email: test@test.com<br/>
        Contraseña: cualquier
      </div>
    </div>
  );
};

export default DemoModeNotification;