import React, { useState, useEffect } from 'react';
import { testSupabaseConnection } from '../services/supabase';
import { AppConstants } from '../utils/constants';

const SupabaseStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    isLoading: true,
    error: null,
    lastChecked: null
  });

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus({
        isConnected: result.success,
        isLoading: false,
        error: result.error,
        lastChecked: new Date()
      });
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        isLoading: false,
        error: error.message,
        lastChecked: new Date()
      });
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (connectionStatus.isLoading) return AppConstants.colors.warning;
    if (connectionStatus.isConnected) return AppConstants.colors.success;
    return AppConstants.colors.error;
  };

  const getStatusText = () => {
    if (connectionStatus.isLoading) return 'Verificando...';
    if (connectionStatus.isConnected) return 'Conectado';
    return 'Desconectado';
  };

  const getStatusIcon = () => {
    if (connectionStatus.isLoading) return '🔄';
    if (connectionStatus.isConnected) return '✅';
    return '❌';
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: AppConstants.colors.cardBg,
      border: `1px solid ${getStatusColor()}40`,
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: AppConstants.colors.textPrimary,
      boxShadow: `0 4px 12px ${getStatusColor()}20`,
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <span style={{ fontSize: '16px' }}>{getStatusIcon()}</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: getStatusColor(), fontWeight: '600' }}>
          Supabase: {getStatusText()}
        </div>
        {connectionStatus.error && (
          <div style={{ 
            fontSize: '12px', 
            color: AppConstants.colors.textMuted,
            marginTop: '2px'
          }}>
            {connectionStatus.error}
          </div>
        )}
        {connectionStatus.lastChecked && (
          <div style={{ 
            fontSize: '11px', 
            color: AppConstants.colors.textMuted,
            marginTop: '2px'
          }}>
            Última verificación: {connectionStatus.lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>
      <button
        onClick={checkConnection}
        disabled={connectionStatus.isLoading}
        style={{
          background: 'none',
          border: 'none',
          color: AppConstants.colors.textMuted,
          cursor: connectionStatus.isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          padding: '4px',
          borderRadius: '4px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!connectionStatus.isLoading) {
            e.target.style.background = AppConstants.colors.primary + '20';
            e.target.style.color = AppConstants.colors.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!connectionStatus.isLoading) {
            e.target.style.background = 'none';
            e.target.style.color = AppConstants.colors.textMuted;
          }
        }}
      >
        🔄
      </button>
    </div>
  );
};

export default SupabaseStatus;