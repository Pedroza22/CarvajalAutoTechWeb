import React, { useState, useEffect } from 'react';
import { getColor } from '../../utils/constants';
import CategoriesService from '../../services/CategoriesService';
import StudentsService from '../../services/StudentsService';
import { supabase } from '../../services/supabase';

const AdminCategoriesPage = ({ onNavigate }) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningCategory, setAssigningCategory] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '📚'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await CategoriesService.getAllCategories();
      setCategories(categoriesData);
      console.log('✅ Categorías cargadas:', categoriesData.length);
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#6366f1',
      icon: '📚'
    });
    setShowCreateModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color || '#6366f1',
      icon: category.icon || '📚'
    });
    setShowCreateModal(true);
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
      try {
        await CategoriesService.deleteCategory(category.id);
        alert('Categoría eliminada exitosamente');
        // Recargar categorías sin afectar el flujo principal
        loadCategories().catch(err => {
          console.error('❌ Error recargando categorías:', err);
        });
      } catch (error) {
        console.error('❌ Error eliminando categoría:', error);
        alert('Error al eliminar la categoría');
      }
    }
  };

  const handleAssignStudents = async (category) => {
    setAssigningCategory(category);
    setShowAssignModal(true);
    await loadStudents();
    await loadAssignedStudents(category.id);
  };

  const loadStudents = async () => {
    try {
      const studentsData = await StudentsService.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('❌ Error cargando estudiantes:', error);
      alert('Error al cargar estudiantes');
    }
  };

  const loadAssignedStudents = async (categoryId) => {
    try {
      // Obtener estudiantes ya asignados a esta categoría
      const { data, error } = await supabase
        .from('student_categories')
        .select('student_id')
        .eq('category_id', categoryId);

      if (error) {
        console.error('❌ Error cargando estudiantes asignados:', error);
        return;
      }

      const assignedIds = data?.map(item => item.student_id) || [];
      setSelectedStudents(assignedIds);
    } catch (error) {
      console.error('❌ Error cargando estudiantes asignados:', error);
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleAssignSubmit = async () => {
    if (!assigningCategory) return;

    try {
      // Obtener estudiantes previamente asignados
      const { data: previouslyAssigned } = await supabase
        .from('student_categories')
        .select('student_id')
        .eq('category_id', assigningCategory.id);

      const previouslyAssignedIds = previouslyAssigned?.map(item => item.student_id) || [];

      // Estudiantes a agregar
      const studentsToAdd = selectedStudents.filter(id => !previouslyAssignedIds.includes(id));
      
      // Estudiantes a eliminar
      const studentsToRemove = previouslyAssignedIds.filter(id => !selectedStudents.includes(id));

      // Agregar estudiantes
      for (const studentId of studentsToAdd) {
        await supabase
          .from('student_categories')
          .insert({
            student_id: studentId,
            category_id: assigningCategory.id,
            published: false
          });
      }

      // Eliminar estudiantes
      for (const studentId of studentsToRemove) {
        await supabase
          .from('student_categories')
          .delete()
          .eq('student_id', studentId)
          .eq('category_id', assigningCategory.id);
      }

      alert('Estudiantes asignados correctamente');
      setShowAssignModal(false);
      setAssigningCategory(null);
      setSelectedStudents([]);
    } catch (error) {
      console.error('❌ Error asignando estudiantes:', error);
      alert('Error al asignar estudiantes');
    }
  };

  // Función para obtener iniciales del estudiante
  const getStudentInitials = (student) => {
    const displayName = StudentsService.getDisplayName(student);
    if (!displayName) return '??';
    
    const parts = displayName.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      if (editingCategory) {
        await CategoriesService.updateCategory(editingCategory.id, formData);
        alert('Categoría actualizada exitosamente');
      } else {
        // Obtener el ID del usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert('Error: Usuario no autenticado');
          return;
        }

        await CategoriesService.createCategory({
          ...formData,
          createdBy: user.id
        });
        alert('Categoría creada exitosamente');
      }
      
      setShowCreateModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#6366f1', icon: '📚' });
      
      // Recargar categorías sin afectar el flujo principal
      loadCategories().catch(err => {
        console.error('❌ Error recargando categorías:', err);
      });
    } catch (error) {
      console.error('❌ Error guardando categoría:', error);
      alert('Error al guardar la categoría');
    }
  };

  const safeColor = (colorName) => getColor(colorName) || '#ffffff';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        Cargando categorías...
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
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: safeColor('textPrimary'),
            margin: '0 0 8px 0'
          }}>
            Gestión de Categorías
          </h1>
          <p style={{
            fontSize: '1rem',
            color: safeColor('textMuted'),
            margin: 0
          }}>
            Organiza las categorías de preguntas del sistema
          </p>
        </div>
        <button
          onClick={handleCreateCategory}
          style={{
            background: safeColor('primary'),
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Nueva Categoría
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: `1px solid ${safeColor('border')}`
      }}>
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${safeColor('border')}`,
            background: safeColor('dark'),
            color: safeColor('textPrimary'),
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Lista de categorías */}
      <div style={{
        background: safeColor('cardBg'),
        borderRadius: '16px',
        border: `1px solid ${safeColor('border')}`,
        overflow: 'hidden'
      }}>
        {filteredCategories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: safeColor('textMuted')
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: '0 0 8px 0',
              color: safeColor('textPrimary')
            }}>
              No hay categorías
            </h3>
            <p style={{ margin: 0 }}>
              {searchTerm
                ? 'No se encontraron categorías con el término de búsqueda'
                : 'Crea tu primera categoría para comenzar'
              }
            </p>
          </div>
        ) : (
          <div>
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                style={{
                  padding: '20px',
                  borderBottom: index < filteredCategories.length - 1 ? `1px solid ${safeColor('border')}33` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                {/* Icono y color */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: category.color || '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'white'
                }}>
                  {category.icon || '📚'}
                </div>

                {/* Información de la categoría */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                    color: safeColor('textPrimary')
                  }}>
                    {category.name}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: safeColor('textMuted'),
                    margin: '0 0 8px 0',
                    lineHeight: '1.4'
                  }}>
                    {category.description || 'Sin descripción'}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '0.8rem',
                    color: safeColor('textMuted')
                  }}>
                    <span>📅 Creada: {formatDate(category.created_at)}</span>
                    <span style={{
                      color: category.is_active ? safeColor('success') : safeColor('error')
                    }}>
                      {category.is_active ? '✅ Activa' : '❌ Inactiva'}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleEditCategory(category)}
                    style={{
                      background: safeColor('warning'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    style={{
                      background: safeColor('error'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
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
        Mostrando {filteredCategories.length} de {categories.length} categorías
      </div>

      {/* Modal para crear/editar categoría */}
      {showCreateModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: safeColor('cardBg'),
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            border: `1px solid ${safeColor('border')}`
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: safeColor('textPrimary'),
              margin: '0 0 20px 0'
            }}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            <form onSubmit={handleSubmitCategory}>
              {/* Nombre */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '8px'
                }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la categoría"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${safeColor('border')}`,
                    background: safeColor('dark'),
                    color: safeColor('textPrimary'),
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '8px'
                }}>
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${safeColor('border')}`,
                    background: safeColor('dark'),
                    color: safeColor('textPrimary'),
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Color */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '8px'
                }}>
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  style={{
                    width: '60px',
                    height: '40px',
                    borderRadius: '8px',
                    border: `1px solid ${safeColor('border')}`,
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Icono */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: safeColor('textPrimary'),
                  marginBottom: '8px'
                }}>
                  Icono
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="📚"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${safeColor('border')}`,
                    background: safeColor('dark'),
                    color: safeColor('textPrimary'),
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Botón Asignar Estudiantes (solo al editar) */}
              {editingCategory && (
                <div style={{ marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      handleAssignStudents(editingCategory);
                    }}
                    style={{
                      background: safeColor('primary'),
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    👥 Asignar Estudiantes
                  </button>
                </div>
              )}

              {/* Botones */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  Cancelar
                </button>
                <button
                  type="submit"
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
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para asignar estudiantes */}
      {showAssignModal && assigningCategory && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: safeColor('cardBg'),
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            border: `1px solid ${safeColor('border')}`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: safeColor('textPrimary'),
              margin: '0 0 20px 0'
            }}>
              Asignar Estudiantes - {assigningCategory.name}
            </h2>

            {/* Búsqueda de estudiantes */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Buscar estudiantes..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${safeColor('border')}`,
                  background: safeColor('dark'),
                  color: safeColor('textPrimary'),
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Lista de estudiantes */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '20px',
              maxHeight: '400px'
            }}>
              {students.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: safeColor('textMuted')
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <p>No hay estudiantes disponibles</p>
                </div>
              ) : students
                .filter(student => {
                  const searchLower = studentSearchTerm.toLowerCase();
                  const name = StudentsService.getDisplayName(student).toLowerCase();
                  const email = student.email?.toLowerCase() || '';
                  return name.includes(searchLower) || email.includes(searchLower);
                })
                .length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: safeColor('textMuted')
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <p>No se encontraron estudiantes con ese criterio de búsqueda</p>
                </div>
              ) : (
                students
                  .filter(student => {
                    const searchLower = studentSearchTerm.toLowerCase();
                    const name = StudentsService.getDisplayName(student).toLowerCase();
                    const email = student.email?.toLowerCase() || '';
                    return name.includes(searchLower) || email.includes(searchLower);
                  })
                  .map(student => {
                  const isSelected = selectedStudents.includes(student.id);
                  const displayName = StudentsService.getDisplayName(student);
                  
                  return (
                    <div
                      key={student.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        border: `1px solid ${isSelected ? safeColor('primary') : safeColor('border')}`,
                        borderRadius: '12px',
                        marginBottom: '8px',
                        background: isSelected ? safeColor('primary') + '15' : safeColor('cardBg'),
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleStudentToggle(student.id)}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.target.style.background = safeColor('primary') + '08';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.target.style.background = safeColor('cardBg');
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStudentToggle(student.id)}
                        style={{
                          transform: 'scale(1.3)',
                          accentColor: safeColor('primary')
                        }}
                      />
                      
                      {/* Avatar */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isSelected ? safeColor('primary') : safeColor('border'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: isSelected ? 'white' : safeColor('textMuted'),
                        flexShrink: 0
                      }}>
                        {getStudentInitials(student)}
                      </div>

                      {/* Información del estudiante */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: safeColor('textPrimary'),
                          margin: '0 0 4px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {displayName}
                        </h4>
                        <p style={{
                          fontSize: '0.85rem',
                          color: safeColor('textMuted'),
                          margin: '0 0 2px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {student.email}
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: safeColor('textMuted'),
                          margin: 0
                        }}>
                          Estudiante registrado
                        </p>
                      </div>

                      {/* Indicador de selección */}
                      {isSelected && (
                        <div style={{
                          color: safeColor('primary'),
                          fontSize: '1.2rem'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setAssigningCategory(null);
                  setSelectedStudents([]);
                  setStudentSearchTerm('');
                }}
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
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAssignSubmit}
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
                Asignar ({selectedStudents.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
