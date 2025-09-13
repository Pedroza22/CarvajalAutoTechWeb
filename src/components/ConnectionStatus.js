import React, { useState, useEffect } from 'react';
import { testSupabaseConnection } from '../services/supabase';

const ConnectionStatus = ({ onConnectionChange }) => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const result = await testSupabaseConnection();
    
    setConnectionStatus(result.success ? 'connected' : 'error');
    setLastCheck(new Date());
    
    if (onConnectionChange) {
      onConnectionChange(result.success);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981'; // green
      case 'error': return '#ef4444'; // red
      case 'checking': return '#f59e0b'; // yellow
      default: return '#6b7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'error': return 'Error de conexión';
      case 'checking': return 'Verificando...';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'error': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '0.8rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer'
    }}
    onClick={checkConnection}
    title={`Última verificación: ${lastCheck ? lastCheck.toLocaleTimeString() : 'Nunca'}`}
    >
      <span>{getStatusIcon()}</span>
      <span style={{ color: getStatusColor(), fontWeight: '600' }}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default ConnectionStatus;
