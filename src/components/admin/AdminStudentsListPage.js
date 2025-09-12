import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import StudentsService from '../../services/StudentsService';

const AdminStudentsListPage = ({ onNavigate }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, sortBy, sortOrder]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await StudentsService.getAllStudents();
      setStudents(studentsData);
      console.log('✅ Estudiantes cargados:', studentsData.length);
    } catch (error) {
      console.error('❌ Error cargando estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'joinedDate':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'lastActivity':
          aValue = new Date(a.lastActivity || a.created_at);
          bValue = new Date(b.lastActivity || b.created_at);
          break;
        case 'totalQuizzes':
          aValue = a.totalQuizzes || 0;
          bValue = b.totalQuizzes || 0;
          break;
        case 'averageScore':
          aValue = a.averageScore || 0;
          bValue = b.averageScore || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStudents(filtered);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleViewStudentDetail = (student) => {
    setShowStudentModal(false);
    onNavigate('student-detail', { student });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return safeColor('success');
      case 'inactive': return safeColor('error');
      case 'pending': return safeColor('warning');
      default: return safeColor('textMuted');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
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
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => onNavigate('admin-home')}
            style={{
              background: 'transparent',
              color: safeColor('textMuted'),
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = safeColor('primary') + '20';
              e.target.style.color = safeColor('primary');
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = safeColor('textMuted');
            }}
          >
            ← Volver
          </button>
          <div>
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: safeColor('textPrimary'),
              margin: '0 0 8px 0'
            }}>
              Lista de Estudiantes
            </h1>
            <p style={{
              fontSize: '1rem',
              color: safeColor('textMuted'),
              margin: 0
            }}>
              Gestiona y supervisa el progreso de los estudiantes
            </p>
          </div>
        </div>
        <div style={{
          fontSize: '1rem',
          color: safeColor('textMuted'),
          background: safeColor('cardBg'),
          padding: '8px 16px',
          borderRadius: '8px',
          border: `1px solid ${safeColor('border')}`
        }}>
          Total: {students.length} estudiantes
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: `1px solid ${safeColor('border')}`,
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Buscar estudiantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${safeColor('border')}`,
            background: safeColor('dark'),
            color: safeColor('textPrimary'),
            fontSize: '1rem'
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            minWidth: '150px',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${safeColor('border')}`,
            background: safeColor('dark'),
            color: safeColor('textPrimary'),
            fontSize: '1rem'
          }}
        >
          <option value="name">Nombre</option>
          <option value="email">Email</option>
          <option value="joinedDate">Fecha de registro</option>
          <option value="lastActivity">Última actividad</option>
          <option value="totalQuizzes">Total quizzes</option>
          <option value="averageScore">Puntuación promedio</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${safeColor('border')}`,
            background: safeColor('dark'),
            color: safeColor('textPrimary'),
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
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
            padding: '60px 20px',
            color: safeColor('textMuted')
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: '0 0 8px 0',
              color: safeColor('textPrimary')
            }}>
              No hay estudiantes
            </h3>
            <p style={{ margin: 0 }}>
              {searchTerm
                ? 'No se encontraron estudiantes con el término de búsqueda'
                : 'No hay estudiantes registrados en el sistema'
              }
            </p>
          </div>
        ) : (
          <div>
            {/* Header de la tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '16px',
              padding: '16px 20px',
              background: safeColor('dark'),
              borderBottom: `1px solid ${safeColor('border')}`,
              fontSize: '0.9rem',
              fontWeight: '600',
              color: safeColor('textMuted')
            }}>
              <div style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Nombre {getSortIcon('name')}
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>
                Email {getSortIcon('email')}
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => handleSort('joinedDate')}>
                Registro {getSortIcon('joinedDate')}
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => handleSort('totalQuizzes')}>
                Quizzes {getSortIcon('totalQuizzes')}
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => handleSort('averageScore')}>
                Promedio {getSortIcon('averageScore')}
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => handleSort('lastActivity')}>
                Actividad {getSortIcon('lastActivity')}
              </div>
              <div>Estado</div>
            </div>

            {/* Filas de estudiantes */}
            {filteredStudents.map((student, index) => (
              <div
                key={student.id}
                onClick={() => handleStudentClick(student)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 1fr',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: index < filteredStudents.length - 1 ? `1px solid ${safeColor('border')}33` : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    background: safeColor('border') + '20'
                  }
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = safeColor('border') + '20';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: safeColor('textPrimary'),
                    marginBottom: '4px'
                  }}>
                    {student.name}
                  </div>
                  {student.studentId && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: safeColor('textMuted')
                    }}>
                      ID: {student.studentId}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: safeColor('textPrimary'),
                  wordBreak: 'break-all'
                }}>
                  {student.email}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: safeColor('textMuted')
                }}>
                  {formatDate(student.created_at)}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: safeColor('textPrimary'),
                  textAlign: 'center'
                }}>
                  {student.totalQuizzes || 0}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: safeColor('success'),
                  textAlign: 'center',
                  fontWeight: '600'
                }}>
                  {student.averageScore ? `${student.averageScore}%` : 'N/A'}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: safeColor('textMuted')
                }}>
                  {formatDate(student.lastActivity)}
                </div>
                <div style={{
                  textAlign: 'center'
                }}>
                  <span style={{
                    background: getStatusColor(student.status || 'active') + '20',
                    color: getStatusColor(student.status || 'active'),
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {getStatusLabel(student.status || 'active')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: safeColor('textMuted'),
        fontSize: '0.9rem'
      }}>
        Mostrando {filteredStudents.length} de {students.length} estudiantes
      </div>

      {/* Modal de información del estudiante */}
      {showStudentModal && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: safeColor('cardBg'),
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            border: `1px solid ${safeColor('border')}`
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: safeColor('textPrimary'),
              margin: '0 0 20px 0'
            }}>
              Información del Estudiante
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: safeColor('textMuted'),
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  Nombre
                </label>
                <div style={{
                  fontSize: '1.1rem',
                  color: safeColor('textPrimary'),
                  fontWeight: '600'
                }}>
                  {selectedStudent.name}
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: safeColor('textMuted'),
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  Email
                </label>
                <div style={{
                  fontSize: '1rem',
                  color: safeColor('textPrimary')
                }}>
                  {selectedStudent.email}
                </div>
              </div>

              {selectedStudent.studentId && (
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: safeColor('textMuted'),
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    ID de Estudiante
                  </label>
                  <div style={{
                    fontSize: '1rem',
                    color: safeColor('textPrimary')
                  }}>
                    {selectedStudent.studentId}
                  </div>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: safeColor('textMuted'),
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    Quizzes Completados
                  </label>
                  <div style={{
                    fontSize: '1.2rem',
                    color: safeColor('primary'),
                    fontWeight: '600'
                  }}>
                    {selectedStudent.totalQuizzes || 0}
                  </div>
                </div>
                <div>
                  <label style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: safeColor('textMuted'),
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    Puntuación Promedio
                  </label>
                  <div style={{
                    fontSize: '1.2rem',
                    color: safeColor('success'),
                    fontWeight: '600'
                  }}>
                    {selectedStudent.averageScore ? `${selectedStudent.averageScore}%` : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: safeColor('textMuted'),
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  Fecha de Registro
                </label>
                <div style={{
                  fontSize: '1rem',
                  color: safeColor('textPrimary')
                }}>
                  {formatDate(selectedStudent.created_at)}
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: safeColor('textMuted'),
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  Estado
                </label>
                <span style={{
                  background: getStatusColor(selectedStudent.status || 'active') + '20',
                  color: getStatusColor(selectedStudent.status || 'active'),
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {getStatusLabel(selectedStudent.status || 'active')}
                </span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowStudentModal(false)}
                style={{
                  background: 'transparent',
                  color: safeColor('textPrimary'),
                  border: `1px solid ${safeColor('border')}`,
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
              <button
                onClick={() => handleViewStudentDetail(selectedStudent)}
                style={{
                  background: safeColor('primary'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Ver Detalle Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsListPage;
