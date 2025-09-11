import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeErrorHandling } from './utils/errorHandler';

// Inicializar manejo de errores antes de renderizar la app
initializeErrorHandling().then(() => {
  console.log('🚀 Iniciando aplicación...');
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
