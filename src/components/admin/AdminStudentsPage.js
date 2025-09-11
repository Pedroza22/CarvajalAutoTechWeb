import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import StatisticsService from '../../services/StatisticsService';

const AdminStudentsPage = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Simular carga de estudiantes (por ahora)
      // En el futuro esto vendrá de un servicio real
      const mockStudents = [
        { id: '1', name: 'Juan Pérez', email: 'juan.perez@email.com', totalAnswers: 45, accuracy: 95 },
        { id: '2', name: 'María García', email: 'maria.garcia@email.com', totalAnswers: 38, accuracy: 92 },
        { id: '3', name: 'Carlos López', email: 'carlos.lopez@email.com', totalAnswers: 42, accuracy: 89 },
        { id: '4', name: 'Ana Martínez', email: 'ana.martinez@email.com', totalAnswers: 35, accuracy: 87 },
        { id: '5', name: 'Luis Rodríguez', email: 'luis.rodriguez@email.com', totalAnswers: 40, accuracy: 85 },
        { id: '6', name: 'Sofia González', email: 'sofia.gonzalez@email.com', totalAnswers: 28, accuracy: 82 },
        { id: '7', name: 'Diego Herrera', email: 'diego.herrera@email.com', totalAnswers: 33, accuracy: 80 },
        { id: '8', name: 'Valentina Silva', email: 'valentina.silva@email.com', totalAnswers: 31, accuracy: 78 },
      ];
      
      setStudents(mockStudents);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleStudentClick = (student) => {
    onNavigate('admin-student-detail', { student });
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: safeColor('textMuted')
      }}>
        Cargando estudiantes...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: safeColor('dark'),
      color: safeColor('textPrimary'),
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: safeColor('textPrimary'),
          margin: 0
        }}>
          Estudiantes
        </h1>
        <button
          onClick={loadStudents}
          style={{
            background: safeColor('primary'),
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        border: `1px solid ${safeColor('border')}`
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              background: safeColor('dark'),
              border: `1px solid ${safeColor('border')}`,
              borderRadius: '8px',
              color: safeColor('textPrimary'),
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: safeColor('textMuted'),
            fontSize: '18px'
          }}>
            🔍
          </div>
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        border: `1px solid ${safeColor('border')}`,
        overflow: 'hidden'
      }}>
        {filteredStudents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: safeColor('textMuted')
          }}>
            {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
          </div>
        ) : (
          <div>
            {filteredStudents.map((student, index) => (
              <div
                key={student.id}
                onClick={() => handleStudentClick(student)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: index < filteredStudents.length - 1 ? `1px solid ${safeColor('border')}33` : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = safeColor('border') + '20';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: safeColor('primary'),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginRight: '16px'
                }}>
                  {getInitials(student.name)}
                </div>

                {/* Información del estudiante */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    marginBottom: '4px'
                  }}>
                    {student.name}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted')
                  }}>
                    {student.email}
                  </div>
                </div>

                {/* Estadísticas */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: safeColor('textPrimary')
                    }}>
                      {student.totalAnswers}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      Respuestas
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: safeColor('success')
                    }}>
                      {student.accuracy}%
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      Precisión
                    </div>
                  </div>

                  <div style={{
                    color: safeColor('textMuted'),
                    fontSize: '20px',
                    marginLeft: '8px'
                  }}>
                    ›
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        color: safeColor('textMuted'),
        fontSize: '0.9rem'
      }}>
        {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? 's' : ''} encontrado{filteredStudents.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default AdminStudentsPage;


