import React, { useState, useEffect, useCallback } from 'react';
import { getColor } from '../utils/constants';
import ExplanationsService from '../services/ExplanationsService';

const StudentExplanations = ({ studentId }) => {
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🔍 StudentExplanations recibió studentId:', studentId);
  console.log('🔄 StudentExplanations renderizando...');

  const loadExplanations = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando explicaciones para estudiante:', studentId);
      const result = await ExplanationsService.getSentExplanations(studentId);
      
      console.log('📊 Resultado de carga de explicaciones:', result);
      
      if (result.success) {
        console.log('✅ Explicaciones cargadas:', result.data);
        setExplanations(result.data);
      } else {
        console.error('❌ Error cargando explicaciones:', result.error);
        setError(result.error);
      }
    } catch (err) {
      setError('Error al cargar las explicaciones');
      console.error('Error cargando explicaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      loadExplanations();
    } else {
      console.log('⚠️ No hay studentId, no cargando explicaciones');
      setLoading(false);
    }
  }, [studentId, loadExplanations]);

  const markAsRead = async (categoryId) => {
    try {
      const result = await ExplanationsService.markAsRead(studentId, categoryId);
      if (result.success) {
        // Actualizar el estado local
        setExplanations(prev => 
          prev.map(exp => 
            exp.category_id === categoryId 
              ? { ...exp, status: 'read', read_at: new Date().toISOString() }
              : exp
          )
        );
        console.log('✅ Explicación marcada como leída');
      } else {
        console.error('❌ Error marcando como leído:', result.error);
      }
    } catch (err) {
      console.error('Error marcando como leído:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: getColor('textMuted')
      }}>
        Cargando explicaciones...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: getColor('error')
      }}>
        Error: {error}
      </div>
    );
  }

  if (explanations.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: getColor('textMuted'),
        background: getColor('cardBg'),
        borderRadius: '12px',
        border: `1px solid ${getColor('border')}`
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <h3 style={{ 
          color: getColor('textPrimary'), 
          margin: '0 0 8px 0',
          fontSize: '1.2rem'
        }}>
          No hay explicaciones disponibles
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          Cuando recibas explicaciones de tus profesores, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {explanations.map((explanation) => (
        <div
          key={explanation.id}
          style={{
            background: getColor('cardBg'),
            border: `1px solid ${getColor('border')}`,
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
        >
            {/* Header con categoría y estado */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: getColor('textPrimary'),
                  margin: '0 0 8px 0',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>📖</span>
                  {explanation.category_name || explanation.category_id}
                </h3>
                
                <div style={{
                  fontSize: '0.85rem',
                  color: getColor('textMuted'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <span>📅 {formatDate(explanation.sent_at)}</span>
                  {explanation.read_at && (
                    <span>👁️ Leído: {formatDate(explanation.read_at)}</span>
                  )}
                </div>
              </div>
              
              {/* Indicador de estado mejorado */}
              <div style={{
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: explanation.status === 'read' ? getColor('success') : getColor('warning'),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {explanation.status === 'read' ? '✅ Leído' : '📬 Nuevo'}
              </div>
            </div>

            {/* Contenido de las explicaciones */}
            <div style={{
              background: getColor('background'),
              border: `1px solid ${getColor('border')}`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.7',
              color: getColor('textPrimary'),
              fontSize: '0.95rem',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: getColor('textMuted'),
                marginBottom: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                📝 Explicaciones Detalladas
              </div>
              {explanation.explanations}
            </div>

            {/* Botón para marcar como leído */}
            {explanation.status === 'sent' && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '16px'
              }}>
                <button
                  onClick={() => markAsRead(explanation.category_id)}
                  style={{
                    background: getColor('primary'),
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = getColor('primaryHover') || getColor('primary');
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = getColor('primary');
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  👁️ Marcar como leído
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
  );
};

export default StudentExplanations;
