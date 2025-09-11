import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { AppTheme } from '../utils/appTheme';
import CustomButton from './CustomButton';

const SupabaseConnectionTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, { test, status, message, data, timestamp: new Date() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Configuración básica
      addResult('Configuración', 'info', 'Verificando configuración...');
      const url = process.env.REACT_APP_SUPABASE_URL;
      const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        addResult('Configuración', 'error', 'Variables de entorno faltantes');
        return;
      }
      addResult('Configuración', 'success', 'Variables de entorno encontradas');

      // Test 2: Conexión básica
      addResult('Conexión', 'info', 'Probando conexión...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addResult('Conexión', 'error', `Error de sesión: ${sessionError.message}`);
      } else {
        addResult('Conexión', 'success', session ? 'Sesión activa' : 'Sin sesión activa');
      }

      // Test 3: Tabla categories
      addResult('Categories', 'info', 'Probando tabla categories...');
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description')
        .limit(5);
      
      if (categoriesError) {
        addResult('Categories', 'error', `Error: ${categoriesError.message}`);
      } else {
        addResult('Categories', 'success', `Encontradas ${categories?.length || 0} categorías`, categories);
      }

      // Test 4: Tabla questions
      addResult('Questions', 'info', 'Probando tabla questions...');
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, question, type, category_id')
        .limit(5);
      
      if (questionsError) {
        addResult('Questions', 'error', `Error: ${questionsError.message}`);
      } else {
        addResult('Questions', 'success', `Encontradas ${questions?.length || 0} preguntas`, questions);
      }

      // Test 5: Tabla user_profiles
      addResult('User Profiles', 'info', 'Probando tabla user_profiles...');
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, email, role')
        .limit(5);
      
      if (profilesError) {
        addResult('User Profiles', 'error', `Error: ${profilesError.message}`);
      } else {
        addResult('User Profiles', 'success', `Encontrados ${profiles?.length || 0} perfiles`, profiles);
      }

    } catch (error) {
      addResult('General', 'error', `Error inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return AppTheme.success;
      case 'error': return AppTheme.error;
      case 'info': return AppTheme.info;
      default: return AppTheme.greyMedium;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '⏳';
    }
  };

  const containerStyle = {
    padding: '20px',
    background: AppTheme.primaryBlack,
    minHeight: '100vh',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '32px',
  };

  const titleStyle = {
    color: AppTheme.white,
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '8px',
  };

  const subtitleStyle = {
    color: AppTheme.greyLight,
    fontSize: '16px',
  };

  const buttonStyle = {
    marginBottom: '32px',
  };

  const resultsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const resultCardStyle = {
    ...AppTheme.card(),
    padding: '16px',
  };

  const resultHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  };

  const testNameStyle = {
    color: AppTheme.white,
    fontSize: '16px',
    fontWeight: '600',
  };

  const messageStyle = {
    color: AppTheme.greyLight,
    fontSize: '14px',
    marginBottom: '8px',
  };

  const dataStyle = {
    background: AppTheme.greyDark,
    padding: '12px',
    borderRadius: AppTheme.borderRadius.small,
    fontSize: '12px',
    color: AppTheme.white,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    maxHeight: '200px',
    overflow: 'auto',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Test de Conexión Supabase</h1>
        <p style={subtitleStyle}>
          Verifica la conexión y el estado de las tablas
        </p>
      </div>

      <div style={buttonStyle}>
        <CustomButton
          text={loading ? "Ejecutando tests..." : "Ejecutar Tests"}
          onClick={runTests}
          disabled={loading}
          isLoading={loading}
          fullWidth={false}
        />
      </div>

      <div style={resultsStyle}>
        {testResults.map((result, index) => (
          <div key={index} style={resultCardStyle}>
            <div style={resultHeaderStyle}>
              <span style={{ color: getStatusColor(result.status), fontSize: '20px' }}>
                {getStatusIcon(result.status)}
              </span>
              <span style={testNameStyle}>{result.test}</span>
            </div>
            <div style={messageStyle}>{result.message}</div>
            {result.data && (
              <div style={dataStyle}>
                {JSON.stringify(result.data, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;