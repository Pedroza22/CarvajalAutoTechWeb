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
            position: 'relative'
          }}
        >
          {/* Header con categoría y estado */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{
                color: getColor('textPrimary'),
                margin: '0 0 4px 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📖 {explanation.category_name || explanation.category_id}
              </h3>
              <p style={{
                color: getColor('textMuted'),
                margin: '0',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                📅 {formatDate(explanation.sent_at)}
              </p>
            </div>
            
            <div style={{
              background: getColor('warning'),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              Nuevo
            </div>
          </div>

          {/* Contenido de las explicaciones */}
          <div style={{
            background: getColor('background'),
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${getColor('border')}33`,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <h4 style={{
              color: getColor('textPrimary'),
              margin: '0 0 12px 0',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📄 EXPLICACIONES DETALLADAS
            </h4>
            
            <div style={{
              color: getColor('textPrimary'),
              lineHeight: '1.5',
              fontSize: '0.85rem'
            }}>
              {explanation.explanations && Array.isArray(explanation.explanations) ? (
                explanation.explanations.map((exp, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <p style={{ 
                      margin: '0 0 6px 0',
                      fontWeight: '500'
                    }}>
                      {index + 1}. Pregunta: "{exp.question}"
                    </p>
                    <p style={{ 
                      margin: '0 0 6px 0',
                      color: getColor('textMuted'),
                      fontSize: '0.8rem'
                    }}>
                      Un veh...
                    </p>
                    <p style={{ 
                      margin: '0 0 4px 0',
                      fontWeight: '500'
                    }}>
                      Explicación:
                    </p>
                    <p style={{ margin: '0' }}>
                      • {exp.explanation}
                    </p>
                    <p style={{ 
                      margin: '4px 0 0 0',
                      fontSize: '0.8rem'
                    }}>
                      o La baja está muy alta (60 psi).
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ color: getColor('textMuted') }}>
                  No hay explicaciones detalladas disponibles
                </p>
              )}
            </div>
          </div>

          {/* Botón de acción */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => markAsRead(explanation.category_id)}
              style={{
                background: getColor('primary'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✓ Marcar como leído
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentExplanations;